// Project: Batle2
//
// Author: Natalchishin Taras
//
// Calabaraburus (c) 2023

import { randomRangeInt, tween, _decorator, assert, game, log, DebugView } from "cc";
import { FieldAnalyzer as FieldAnalyzer } from "../entities/field/FieldAnalizer";
import type { ITileFieldController } from "../entities/field/ITileFieldController";
import "../entities/field/FieldExtensions";
import {
  AnalizedData,
  AnalizedData as AnalyzedData,
  TileTypeToConnectedTiles,
} from "../entities/field/AnalizedData";

import { IBot } from "./IBot";
import { TileController } from "../entities/tiles/TileController";
import { Service } from "../entities/services/Service";
import { TileService } from "../entities/services/TileService";
import { PlayerModel } from "../models/PlayerModel";
import { DataService } from "../entities/services/DataService";
import { GameManager } from "../entities/game/GameManager";
import { CardService } from "../entities/services/CardService";
import { BotTileSelectionStrategy } from "./BotTileSelectionStrategy";
import { StdSelectorBotStrategy } from "./StdSelectorBotStrategy";
import { ICloneable, isICloneable } from "../scripts/ICloneable";
import { isIVirtualisable } from "../scripts/IVirtualisable";
import { FieldControllerExtensions } from "../entities/field/FieldExtensions";
import { RaitingEvaluator as RatingEvaluator } from "./RaitingEvaluator";
import { BehaviourSelector } from "../entities/behaviours/BehaviourSelector";
import { ObjectsCache } from "../ObjectsCache/ObjectsCache";
import { DataServiceForBot } from "./DataServiceForBot";
import { LevelModel } from "../models/LevelModel";
import { CardServiceForBot } from "./CardServiceForBot";
import { GameStateWritable } from "../entities/game/GameStateWritable";
import { CardAnalizator } from "./CardAnalizator";
import { DefaultBotAnalizator } from "./analizators/DefaultBotAnalizator";
import { BonusModel } from "../models/BonusModel";
import { CardsBehaviour } from "../entities/tiles/Behaviours/CardsBehaviour";
import { EffectsService } from "../entities/services/EffectsService";
import { EffectsManagerForBot } from "./EffectsManagerForBot";
import { AudioManagerService } from "../soundsPlayer/AudioManagerService";
import { EffectsManager } from "../entities/game/EffectsManager";
import { Queue } from "../scripts/Queue";
import { StdTileInterBehaviour } from "../entities/tiles/Behaviours/StdTileInterBehaviour";
import { CounterattackCardBotAnalizator } from "./analizators/CounterattackCardBotAnalizator";
import { PerdefinedScoreCardAnalizator as PerdefinedScoreCardBotAnalizator } from "./analizators/PerdefinedScoreCardAnalizator";
import { EotForBot } from "./EotForBot";
import { SummonToMyArmyBotAnalizator } from "./analizators/SummonToMyArmyBotAnalizator";
import { PerdefinedScoreRandomCardAnalizator } from "./analizators/PerdefinedScoreRandomCardAnalizator";
import { ManeuverCardAnalizator } from "./analizators/ManeuverCardAnalizator";
import { DebugViewForBot } from "./DebugViewForBot";
import { DEBUG } from "cc/env";
import { ShieldBotAnalizator } from "./analizators/ShieldBotAnalizator";
import { AllMyTilesBotAnalizator } from "./analizators/AllMyTilesBotAnalizator";
import { IN_DEBUG } from "../globals/globals";

const { ccclass, property } = _decorator;

interface TilesSelctorStrategyGroup {
  [key: string]: BotTileSelectionStrategy;
}

interface CardSelctorStrategyGroup {
  [key: string]: CardAnalizator;
}

@ccclass("Bot_v2")
export class Bot_v2 extends Service implements IBot {
  private _botModel: PlayerModel;
  private _playerModel: PlayerModel;
  private _dataService: DataService;
  private _tileService: TileService;
  private _cardService: CardService;
  private _ratingEvaluator: RatingEvaluator;

  private _tileSelectorStrateges: TilesSelctorStrategyGroup = {
    stdTilesSelector: new StdSelectorBotStrategy(this),
  };

  private _cardStrategiesActivators = new Map<string, (bonus: BonusModel) => CardAnalizator>();
  private _cardAnalizators = new Map<string, CardAnalizator>();

  private _behaviourSelector: BehaviourSelector;
  private _internalDataService: DataServiceForBot;
  private _levelModel: LevelModel;
  private _internalCardService: CardServiceForBot;
  private _gameState: GameStateWritable;
  private _cardsBehaviour: CardsBehaviour;
  private _gameManager: GameManager;
  private _effectsManager: EffectsManager;
  private _stdTileBehave: StdTileInterBehaviour;
  private _queue: Queue<() => void>;
  private _strengthMin: number = 1;
  private _strengthMax: number = 1;

  public get dataService() {
    return this._dataService;
  }

  public get cardService() {
    return this._cardService;
  }

  public get tileService() {
    return this._tileService;
  }

  public get botModel() {
    return this._botModel;
  }

  public get strengthMin() {
    return this._strengthMin;
  }

  public set strengthMin(value: number) {
    this._strengthMin = value;
  }

  public get strengthMax() {
    return this._strengthMax;
  }

  public set strengthMax(value: number) {
    this._strengthMax = value;
  }


  start() {
    this._dataService = this.getServiceOrThrow(DataService);
    this._tileService = this.getServiceOrThrow(TileService);
    this._cardService = this.getServiceOrThrow(CardService);

    this._gameState = new GameStateWritable();

    this._gameState.isPlayerTurn = false;

    this._levelModel = this.getServiceOrThrow(LevelModel);

    this._behaviourSelector = this.getServiceOrThrow(BehaviourSelector);

    // Create cloned behaviours for internal bot actions
    this._behaviourSelector = this._behaviourSelector.clone();

    this._botModel = this._dataService.botModel;
    this._playerModel = this._dataService.playerModel;

    this._internalDataService = this.getBotDataService();
    this._internalCardService = this.getBotCardService();

    this._effectsManager = this.getServiceOrThrow(EffectsManager);

    const effectsManager = new EffectsManagerForBot();

    this._behaviourSelector.Setup(this.getServiceOrThrow(ObjectsCache),
      this._internalCardService,
      this._internalDataService,
      this._levelModel,
      this._gameState,
      this.getServiceOrThrow(EffectsService),
      effectsManager,
      this.getServiceOrThrow(AudioManagerService),
      new EotForBot(this.getServiceOrThrow(GameManager), effectsManager)
    );

    const cb = this._behaviourSelector.getBehaviour(CardsBehaviour);

    if (cb != null) {
      this._cardsBehaviour = cb;
      this._cardsBehaviour.applyCardsLogicOnly = true;
    }

    const stib = this._behaviourSelector.getBehaviour(StdTileInterBehaviour);

    if (stib != null) {
      this._stdTileBehave = stib;
      this._stdTileBehave.doNotUpdateMana = true;
    }

    this.initCardActivators();
    this.initCardAnalizators();
  }

  private initCardActivators() {
    var field = this._dataService.field;
    this._cardStrategiesActivators.set("firewall", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("firewallLow", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("firewallMiddle", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("c_attack", cm => new CounterattackCardBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("push", cm => new CounterattackCardBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("lightning", cm => new PerdefinedScoreCardBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("lightningLow", cm => new PerdefinedScoreCardBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("lightningMiddle", cm => new PerdefinedScoreCardBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("totemLow", cm => new PerdefinedScoreCardBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("totem", cm => new PerdefinedScoreCardBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("mineLow", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("mine", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("meteorite", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("meteoriteLow", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("meteoriteMiddle", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("catapultLow", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("catapult", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("shamanLow", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("shaman", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("worm", cm => new PerdefinedScoreRandomCardAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("wormLow", cm => new PerdefinedScoreRandomCardAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("wormMiddle", cm => new PerdefinedScoreRandomCardAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("pike", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("pikeLow", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("pikeMiddle", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("berserkLow", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("berserk", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("assassinLow", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("assassin", cm => new SummonToMyArmyBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("maneuver", cm => new AllMyTilesBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("shield", cm => new ShieldBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("panic", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));

    this._cardStrategiesActivators.set("hammer", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("hammerLow", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
    this._cardStrategiesActivators.set("hammerMiddle", cm => new DefaultBotAnalizator(cm, this, field, this._playerModel));
  }

  private initCardAnalizators() {
    this._botModel.bonuses.forEach(b => {
      if (!this._cardAnalizators.has(b.mnemonic)) {
        const activator = this._cardStrategiesActivators.get(b.mnemonic);
        assert(activator != null, "can't find " + b.mnemonic + "activator");
        this._cardAnalizators.set(b.mnemonic, activator(b));
      }
    });
  }

  private getBotDataService(): DataServiceForBot {

    const result = new DataServiceForBot();
    result.debugView = new DebugViewForBot();
    result.botModel = this._botModel;
    result.playerModel = this._playerModel;
    result.enemyFieldController = this._dataService.enemyFieldController;
    result.playerFieldController = this._dataService.playerFieldController;

    return result;
  }

  private getBotCardService(): CardServiceForBot {

    const result = new CardServiceForBot();

    result.dataService = this._internalDataService;
    result.levelModel = this._levelModel;

    return result;
  }


  public move(): void {

    let clonedField = this.cloneField();

    if (IN_DEBUG()) {
      console.log("[Bot] Start to analize move");

      console.log(`[Bot] internalDataService ${this._internalDataService == null}`);
      console.log(`[Bot] internalDataService ${this._internalDataService.debugView == null}`);
      console.log(`[Bot] internalDataService ${this._internalDataService.botModel == null}`);
      console.log(`[Bot] internalDataService ${this._internalDataService.playerModel == null}`);
      console.log(`[Bot] internalDataService ${this._internalDataService.enemyFieldController == null}`);
      console.log(`[Bot] internalDataService ${this._internalDataService.playerFieldController == null}`);
      console.log(`[Bot] internalCardService ${this._internalCardService == null}`);
      console.log(`[Bot] internalCardService ${this._internalCardService.levelModel == null}`);
      console.log(`[Bot] internalCardService ${this._internalCardService.dataService == null}`);
      console.log(`[Bot] behaviourSelector ${this._behaviourSelector == null}`);

      console.log(`[Bot] _cardsBehaviour ${this._cardsBehaviour == null}`);
      console.log(`[Bot] _stdTileBehave ${this._stdTileBehave == null}`);
    }
    //console.log(JSON.stringify(this._internalCardService));

    const results: RatingResult[] = [];

    const fieldExt = new FieldControllerExtensions(this.dataService.field);

    // player is enemy for bot
    this._ratingEvaluator = new RatingEvaluator(
      fieldExt,
      this.botModel,
      this._playerModel);


    this._queue = new Queue<() => void>();

    if (IN_DEBUG()) console.log(`[Bot] Analizers size: ${this._cardAnalizators.size}`);

    if (this._cardAnalizators.size > 0) {

      this._cardAnalizators.forEach(c => {
        this._queue.enqueue(() => {

          if (IN_DEBUG()) console.log(`[Bot] Try to activate Card ${c.cardModel.mnemonic}`);
          const analizator = this._cardAnalizators.get(c.cardModel.mnemonic);

          if (analizator != null && analizator.canActivateCard()) {
            if (IN_DEBUG()) console.log(`[Bot] Run analizator`);

            try {
              const result = this.getTileForCardActivation(clonedField, analizator);
              if (result != null) {
                this.botModel.setBonus(c.cardModel);

                // this.debugTile(tile);

                if (IN_DEBUG()) console.log(`[Bot] Activate card on tile {${result.row},${result.col}}`);

                this.pressTileRC(result.row, result.col)

                if (IN_DEBUG()) console.log(`[Bot] Card have been activated`);

              } else {
                // this.debugTile(tile);
              }

            } catch (error) {
              if (IN_DEBUG()) console.log(`[Bot][Error] ${error}`);
            }

          }
        });
      });
    }

    this._queue.enqueue(() => {

      if (IN_DEBUG()) console.log(`[Bot] Try to find best tile to tap`);

      clonedField.reset();

      clonedField = this.cloneField();

      this.botModel.unSetBonus();
      this.getTilesRating(clonedField, [], results);

      clonedField.reset();

      results.sort((r1, r2) => -(r1.rating - r2.rating));

      if (IN_DEBUG()) console.log(`[Bot] ratings ${results.map(r => r.rating).join("|")}`);

      const result = this.selectTileBasedOnStrength(results);
      //      this.debugTile(tile);
      if (IN_DEBUG()) console.log(`[Bot] Activate tile {${result.row},${result.col}}`);

      this.pressTileRC(result.row, result.col)

    });
  }

  selectTileBasedOnStrength(results: RatingResult[]) {
    const tmp = [... new Set(results)];

    const maxC = Math.round(tmp.length * (1 - this._strengthMin));
    const minC = Math.round(tmp.length * (1 - this._strengthMax));

    if (minC == maxC) return tmp[0];

    const index = Math.round(Math.random() * (maxC - minC) + minC);

    return tmp[index];
  }

  cloneField() {
    let clonedField: ITileFieldController;
    const field = this._dataService.field;

    if (isICloneable(field)) {
      clonedField =
        field.clone() as ITileFieldController;
    } else {
      throw Error("logicField must be clonable.");
    }

    if (isIVirtualisable(clonedField)) {
      clonedField.virtualize();
    } else {
      throw Error("Field isn't virtualizable.");
    }

    return clonedField;
  }

  debugTile(tile: TileController | null, preStr = "[Bot][TileDebug]") {
    if (IN_DEBUG()) {
      if (tile == null) {
        console.log(`${preStr} Tile is null`);

      } else {
        console.log(`${preStr} pos: {${tile.row},${tile.col}}`);
        console.log(`${preStr} model: ${tile.tileModel.tileName}`);
        console.log(`${preStr} playerModel: ${tile.playerModel == null ?
          '-' :
          tile.playerModel.playerName}`);
      }
    }
  }

  private getComplexRating(
    field: ITileFieldController,
    cards: CardToTile[],
    startTiles: TileController[],
    endTiles: TileController[],
    results: RatingResult[]
  ) {
    if (isICloneable(field)) {
      const clonedFieldForCard = field.clone() as ITileFieldController;

      const fieldExt = new FieldControllerExtensions(clonedFieldForCard);
      let pt = fieldExt.getPlayerTiles(this._playerModel);

      cards.forEach(c => {
        this._botModel.setBonus(c.cardModel);
        this._internalDataService.field = clonedFieldForCard;
        this._internalDataService.fieldAnalizer = new FieldAnalyzer(clonedFieldForCard);
        this._behaviourSelector.run(clonedFieldForCard.fieldMatrix.get(c.tile.row, c.tile.col));
        this._botModel.unSetBonus();
        this.updateField(clonedFieldForCard);
      });

      pt = fieldExt.getPlayerTiles(this._playerModel);

      this.getTilesRating(clonedFieldForCard, cards, results);

      clonedFieldForCard.reset();
    }
  }

  private getTilesRating(
    field: ITileFieldController,
    cards: CardToTile[],
    results: RatingResult[]) {

    console.log("[Bot] getTilesRating");

    const analizer = new FieldAnalyzer(field);
    const data = analizer.analyze();
    const tiles = this.getTilesForTouch(data);
    const fieldExt = new FieldControllerExtensions(field);

    tiles.forEach(t => {

      if (IN_DEBUG()) console.log(`[Bot] tile: ${t == null ? 'null' : `{${t.row};${t.col}}`}`);

      if (isICloneable(field)) {
        if (IN_DEBUG()) console.log("[Bot] try to clone field");

        const clonedFieldForTiles = field.clone() as ITileFieldController;

        if (IN_DEBUG()) console.log("[Bot] cloned");

        fieldExt.setField(clonedFieldForTiles);

        const result = new RatingResult();

        result.rating = this.getTileRating(fieldExt, t);
        result.cards = cards;
        result.row = t.row;
        result.col = t.col;

        results.push(result);

        clonedFieldForTiles.reset();
      }
    });
  }

  private getTileForCardActivation(
    field: ITileFieldController,
    ca: CardAnalizator): RatingResult | null {

    const fieldExt = new FieldControllerExtensions(field);
    const analizer = new FieldAnalyzer(fieldExt.field);

    ca.field = field;

    const tiles = ca.getAvailableTilesForAction(analizer.analyze());

    const ratingList: RatingResult[] = [];
    this._botModel.setBonus(ca.cardModel);

    tiles.forEach(t => {
      if (isICloneable(field)) {
        const clonedFieldForCard = field.clone() as ITileFieldController;
        fieldExt.setField(clonedFieldForCard);
        this._internalDataService.field = clonedFieldForCard;
        analizer.field = clonedFieldForCard;
        this._internalDataService.fieldAnalizer = analizer;

        const tt = clonedFieldForCard.fieldMatrix.get(t.row, t.col);

        this.debugTile(tt, "[Bot][cuca]");

        this._behaviourSelector.run(tt);
        this.updateField(clonedFieldForCard);

        const res = new RatingResult();
        res.row = t.row;
        res.col = t.col;

        res.rating = this.getTileRating(fieldExt, null);

        if (IN_DEBUG()) {
          console.log(`[Bot][TileDebug] pos: {${res.row},${res.col}}`);
          console.log(`[Bot][TileDebug] rating: {${res.rating}}`);
        }

        ratingList.push(res);

        clonedFieldForCard.reset();
      }
    });

    if (ratingList.length > 0) {
      const top = ratingList.sort((r1, r2) => -(r1.rating - r2.rating))

      console.log(`[Bot] card ratings: ${ratingList.map(r => r.rating).join("|")}`);

      // console.log(`[Bot] Run analizator: ${top.mnemonic}`);

      return top[0];

    } else {
      return null;
    }
  }

  private getTileRating(
    fieldExt: FieldControllerExtensions,
    tile: TileController | null): number {

    if (IN_DEBUG()) console.log(`[Bot] getTileRating2`);

    this._internalDataService.field = fieldExt.field;
    this._internalDataService.fieldAnalizer = new FieldAnalyzer(fieldExt.field);

    if (IN_DEBUG()) console.log(`[Bot] this._internalDataService.field ${this._internalDataService.field == null}`);
    if (IN_DEBUG()) console.log(`[Bot] this._internalDataService.fieldAnalizer ${this._internalDataService.fieldAnalizer == null}`);

    this.debugTile(tile);

    if (tile != null) {

      if (IN_DEBUG()) console.log(`[Bot] bs before run`);

      if (IN_DEBUG()) console.log(`[Bot] fieldExt.field ${fieldExt.field == null}`);
      if (IN_DEBUG()) console.log(`[Bot] fieldExt.field.fieldMatrix ${fieldExt.field.fieldMatrix == null}`);


      const cTile = fieldExt.field.fieldMatrix.get(tile.row, tile.col)

      if (IN_DEBUG()) console.log(`[Bot] cTile ${cTile == null}`);

      if (IN_DEBUG()) {
        fieldExt.field.fieldMatrix.forEach((item, i, j) => {

          if (item != null && fieldExt.field.fieldMatrix.get(i, j) != fieldExt.field.fieldMatrix.get(item.row, item.col)) {
            log();
          }
        });
      }

      this._behaviourSelector.run(cTile);

      if (IN_DEBUG()) {
        fieldExt.field.fieldMatrix.forEach((item, i, j) => {

          if (item != null && fieldExt.field.fieldMatrix.get(i, j) != fieldExt.field.fieldMatrix.get(item.row, item.col)) {
            log();
          }
        });
      }

      if (IN_DEBUG()) console.log(`[Bot] bs after run`);

      this.updateField(fieldExt.field);
    }

    this._ratingEvaluator.fieldExt = fieldExt;

    return this._ratingEvaluator.getRating();
  }

  private updateField(field: ITileFieldController) {
    field.moveTilesLogicaly(true);
    field.fixTiles();
    field.flush();
  }

  private getTilesForTouch(analysedData: AnalyzedData) {
    const result: TileController[] = [];

    for (const key in this._tileSelectorStrateges) {
      if (
        Object.prototype.hasOwnProperty.call(this._tileSelectorStrateges, key)
      ) {
        const element = this._tileSelectorStrateges[
          key
        ] as BotTileSelectionStrategy;
        if (element != null) {
          let tls = element.getAvailableTilesForAction(analysedData);

          result.push(...tls);
        }
      }
    }

    return result;
  };

  pressTileSet(tiles: Set<TileController>) {
    this.pressTileArray(new Array(...tiles.values()));
  }

  pressTileArray(tiles: TileController[]) {
    const tileId = randomRangeInt(0, tiles.length);
    const tileToPress = Array.from(tiles.values());
    this.pressTile(tileToPress[tileId]);
  }

  pressTileRC(row: number, col: number) {
    this.pressTile(this._dataService.field.fieldMatrix.get(row, col));
  }

  pressTile(tile: TileController | null) {
    tile?.clicked();
    console.log(`[Bot] Clicked tile r:${tile?.row} c:${tile?.col}`);
  }

  pressTileSelectedByIndexes(field: ITileFieldController, row: number, col: number) {
    const tile = field.fieldMatrix.get(row, col);
    tile?.clicked();
  }

  protected update(dt: number): void {
    if (this._queue == null) return;

    if (!this._effectsManager.effectIsRunning) {
      if (this._queue.length > 0) {
        const action = this._queue.dequeue();
        action();
      }
    }
  }

  private analize(): boolean {
    throw new Error();
    //field.logicField;
  }
}

class CardToTile {
  public cardModel: BonusModel;
  public tile: TileController;

  public constructor(card: BonusModel, tile: TileController) {
    this.cardModel = card;
    this.tile = tile;
  }
}

class RatingResult {
  public rating: number;
  public cards: CardToTile[];
  public row: number;
  public col: number;
}


