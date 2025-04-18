//  gameManager.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  Component,
  debug,
  director,
  tween,
  _decorator,
  assert,
  AudioSource,
  log,
  RichText,
  Tween,
} from "cc";
import type { IBot } from "../../bot/IBot";
import { LevelController } from "../level/LevelController";
import { FieldController } from "../field/FieldController";
import { FieldAnalyzer } from "../field/FieldAnalizer";
import Finity from "finity";
import { StateMachine } from "finity";
import { BehaviourSelector } from "../behaviours/BehaviourSelector";
import { TileController } from "../tiles/TileController";
import { DebugView } from "../ui/debugger/DebugView";
import { Service } from "../services/Service";
import { CardService } from "../services/CardService";
import { DataService } from "../services/DataService";
import { TileService } from "../services/TileService";
import { TileCreator } from "../field/TileCreator";
import { MatchStatisticService } from "../services/MatchStatisticService";
import { AudioManager } from "../../soundsPlayer/AudioManager";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { MenuSelectorController } from "../menu/MenuSelectorController";
import { Bot_v2 } from "../../bot/Bot_v2";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { LevelModel } from "../../models/LevelModel";
import { GameState } from "./GameState";
import { GameStateWritable } from "./GameStateWritable";
import { EffectsService } from "../services/EffectsService";
import { EffectsManager } from "./EffectsManager";
import { EOTInvoker } from "./EOTInvoker";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { FieldModel } from "../../models/FieldModel";
import { StartTurnMessage } from "../ui/StartTurnMessage";
import { IN_DEBUG } from "../../globals/globals";
import { DEBUG } from "cc/env";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Service {
  private _debug: DebugView | null | undefined;
  //private _botTurn: boolean;
  private _field: FieldController;
  private _fieldAnalizer: FieldAnalyzer;
  private _cardService: CardService | null;
  private _dataService: DataService | null;
  private _tileService: TileService | null;
  private _matchStatistic: MatchStatisticService | null;
  private _audioManager: AudioManagerService;
  private _needToSkipBotTurn: boolean = false;
  private _clickIsProcceeding = false;
  private _bot: IBot | null;
  private _isStarted = false;

  // remove this
  public fakeTiles: TileController[] = []

  //@property(LevelController)
  levelController: LevelController;

  //@property({ type: BehaviourSelector })
  behaviourSeletor: BehaviourSelector;

  public get needToSkipBotTurn() {
    return this._needToSkipBotTurn;
  }

  public get isStarted() {
    return this._isStarted;
  }

  private gameEndsCondition() {
    try {
      return !this.isGameEnded();
    } catch (error) {
      return false;
    }
  }

  private readonly _stateMachineConfig = Finity.configure()

    // initial state #######################################

    .initialState("initGame")
    .onEnter(() => this.initGame())
    .on("end")
    .transitionTo("endGame")

    .on("gameStartEvent")
    .transitionTo("playerTurn")

    //-------------------------------------------------------

    // player turn state ####################################

    .state("playerTurn")
    .onEnter(() => this.startPlayerTurn())

    .on("end")
    .transitionTo("endGame")

    .on("endTurnEvent")
    .transitionTo("beforeEndTurn")
    .withCondition(() => this.canEndTurn() && !this._needToSkipBotTurn).ignore()

    //-------------------------------------------------------

    // before end turn state ################################

    .state("beforeEndTurn")
    .onEnter(() => this.beforeEndTurn())

    .on("end")
    .transitionTo("endGame")

    .on("endTurnServiceEvent")
    .transitionTo("endTurn")

    //-------------------------------------------------------

    // end turn state #######################################

    .state("endTurn")
    .onEnter(() => this.endTurnStateMachine())

    .on("end")
    .transitionTo("endGame")

    .do(() => {
      return this._gameState.isPlayerTurn ? Promise.resolve() : Promise.reject();
    })
    .onSuccess().transitionTo("beforeBotTurn")
    .withCondition(() => this.gameEndsCondition()).ignore()
    .onFailure().transitionTo("beforePlayerTurn")
    .withCondition(() => this.gameEndsCondition()).ignore()

    //-------------------------------------------------------

    // before bot turn state ################################

    .state("beforeBotTurn")
    .onEnter(() => this.beforeBotTurn())

    .on("end")
    .transitionTo("endGame")

    .on("endBeforeTurn")
    .transitionTo("botTurn")

    //-------------------------------------------------------

    // before player turn state #############################

    .state("beforePlayerTurn")
    .onEnter(() => this.beforePlayerTurn())

    .on("end")
    .transitionTo("endGame")

    .on("endBeforeTurn")
    .transitionTo("playerTurn")

    //-------------------------------------------------------

    // bot turn state #######################################

    .state("botTurn")
    .onEnter(() => this.startBotTurn())

    .on("end")
    .transitionTo("endGame")

    .on("endTurnEvent")
    .transitionTo("beforeEndTurn")

    //-------------------------------------------------------

    // end game state #######################################

    .state("endGame")
    .onEnter(() => {
      this._isStarted = false;
      this._eotInvoker.stop();
    })

    //-------------------------------------------------------

    .global()
    .onStateEnter((state) => {
      if (DEBUG) console.log(`Entering state '${state}'`);
    })
    .onStateExit((state) => {
      if (DEBUG) console.log(`Exit state '${state}'`);
    });

  private _stateMachine: StateMachine<string, string>;
  //private _menuSelector: MenuSelectorController | null;
  private _gameState: GameStateWritable;
  private _effectsManager: EffectsManager; //
  private _eotInvoker: EOTInvoker;
  private _levelConfiguration: LevelConfiguration;
  private _startTurnMessage: StartTurnMessage;

  public get playerTurn(): boolean {
    return this._gameState.isPlayerTurn;
  }

  start() {
    this._levelConfiguration = this.getServiceOrThrow(LevelConfiguration);
    this._cardService = this.getServiceOrThrow(CardService);
    this._dataService = this.getServiceOrThrow(DataService);
    this._tileService = this.getServiceOrThrow(TileService);
    this._matchStatistic = this.getServiceOrThrow(MatchStatisticService);
    this._audioManager = this.getServiceOrThrow(AudioManagerService);
    this._startTurnMessage = this.getServiceOrThrow(StartTurnMessage);
    this.levelController = this.getServiceOrThrow(LevelController);
    this.behaviourSeletor = this.getServiceOrThrow(BehaviourSelector);

    //this._menuSelector = this.getServiceOrThrow(MenuSelectorController);
    this._gameState = this.getServiceOrThrow(GameStateWritable);
    this._gameState.isPlayerTurn = true;

    this._bot = this.getServiceOrThrow(Bot_v2);
    this._debug = this._dataService?.debugView;

    const model = this._levelConfiguration.getComponentInChildren(LevelModel);
    assert(model != null);
    this.levelController.model = model;

    this.levelController.levelConfiguration = this._levelConfiguration;

    this._field = this.levelController.fieldController;

    this._field.tileCreator = this.getService(TileCreator);
    this._fieldAnalizer = new FieldAnalyzer(this._field.logicField);

    this._effectsManager = this.getServiceOrThrow(EffectsManager);

    this._eotInvoker = new EOTInvoker(this, this._effectsManager);

    this.behaviourSeletor.Setup(
      this.getServiceOrThrow(ObjectsCache),
      this._cardService,
      this._dataService,
      this.getServiceOrThrow(LevelModel),
      this._gameState,
      this.getServiceOrThrow(EffectsService),
      this._effectsManager,
      this.getServiceOrThrow(AudioManagerService),
      this._eotInvoker
    );

    this._stateMachine = this._stateMachineConfig.start();
    this._stateMachine.handle("gameStartEvent");
  }

  isGameEnded() {
    const playerModel = this.levelController.playerField.playerModel;
    const enemyModel = this.levelController.enemyField.playerModel;

    return !(playerModel.life > 0 && enemyModel.life > 0);
  }

  public stop() {
    if (this._isStarted) this._stateMachine.handle("end");
  }

  initGame(): void {
    this._field.tileClickedEvent.on("FieldController", this.tileClicked, this);
    this._field.generateTiles();
    this._field.moveTiles();
    this._field.analizeTiles();
    this._field.fixTiles();

    // this._field.updateBackground();
    this.levelController.updateData();

    // start statistic counter
    this._matchStatistic?.startTileStatistic();

    this._isStarted = true;
  }

  private tileClicked(sender: unknown, tile: TileController): void {
    //if (this._clickIsProcceeding) return;
    //this._clickIsProcceeding = true;
    this.lockUi();

    if (IN_DEBUG()) console.log("[GameManager] Tile clicked");
    this.behaviourSeletor.run(tile);

    this.waitAnimations(() => {
      //  this._clickIsProcceeding = false;
      if (this._stateMachine.getCurrentState() == "playerTurn") {
        this.unlockUi();
      }
      //   this.moveTiles();
    });
  }

  private waitAnimations(action: () => void) {
    const waiter = tween(this);

    waiter.repeatForever(
      tween(this)
        .call(() => {
          if (!this._effectsManager.effectIsRunning) {

            try {
              action();
            } catch (error) {
              if (IN_DEBUG()) console.error(error);
            }

            waiter.stop();
          }
        })
        .delay(0.2)
    );

    waiter.start();
  }

  private waitClickProcceeds(action: () => void) {
    const waiter = tween(this);

    waiter.repeatForever(
      tween(this)
        .call(() => {
          if (!this._clickIsProcceeding) {
            action();
            waiter.stop();
          }
        })
        .delay(0.2)
    );

    waiter.start();
  }

  public changeGameState(stateName: string) {
    this._stateMachine.handle(stateName);
  }

  public currentGameState() {
    return this._stateMachine.getCurrentState();
  }

  private _uiIsLocked: boolean;
  public get uiIsLocked() {
    return this._uiIsLocked;
  }

  public unlockUi(): void {
    this._uiIsLocked = true;
    this.levelController.lockTuch(false);
  }

  public lockUi(): void {
    this._uiIsLocked = false;
    this.levelController.lockTuch(true);
  }

  public get isBehavioursInProccess() {
    return this.behaviourSeletor.hasBehavioursInProccess();
  }

  startPlayerTurn(): void {
    this._gameState.isPlayerTurn = true;
    this._debug?.log("Cache size:" + ObjectsCache.instance?.size);
    this._startTurnMessage.show();
    this.unlockUi();
  }

  canEndTurn(): boolean {
    return true;
  }

  private beforeBotTurn() {
    this.waitAnimations(() => {
      this.notifyTilesAboutStartOfTurn();
      this.showEndLevelWindowIfNeeded();

      this.waitAnimations(() => {
        this._cardService?.resetBonusesForActivePlayer();

        this._cardService?.updateBonusesActiveState();

        this.levelController.updateData();

        if (!this.isGameEnded()) this._stateMachine.handle("endBeforeTurn");

      });
    });
  }

  private beforePlayerTurn() {
    this.waitAnimations(() => {
      this.notifyTilesAboutStartOfTurn();
      this.showEndLevelWindowIfNeeded();

      this.waitAnimations(() => {
        this._cardService?.resetBonusesForActivePlayer();

        this._cardService?.updateBonusesActiveState();

        this._tileService?.prepareForNewTurn();

        this.levelController.updateData();

        if (!this.isGameEnded()) this._stateMachine.handle("endBeforeTurn");

      });
    });
  }

  private beforeEndTurn() {
    const schedule = tween(this);

    this.waitAnimations(() => {
      this.notifyTilesAboutEndOfTurn();
      this.waitAnimations(() => { this._stateMachine.handle("endTurnServiceEvent"); });
    });
  }

  private endTurnStateMachine() {
    try {
      this._field.analizeTiles();
      this._field.fixTiles();
      this._field.moveTilesAnimate();

      this.updatePlayersLifeData();
      this.showEndLevelWindowIfNeeded();
    } catch (error) {
      if (IN_DEBUG()) console.error(error);
    }
  }

  updatePlayersLifeData() {
    try {
      const playerModel = this.levelController.playerField.playerModel;
      const enemyModel = this.levelController.enemyField.playerModel;

      if (this._gameState.isPlayerTurn) {
        enemyModel.life -= this.countAttackingTiles("end") * playerModel.power;
        this.levelController.signalController.atack(false);
      } else {
        playerModel.life -= this.countAttackingTiles("start") * enemyModel.power;
        this.levelController.signalController.atack(true);
      }

      this.levelController.updateData();

    } catch (error) {
      if (IN_DEBUG()) console.error(error);
    }
  }

  showEndLevelWindowIfNeeded() {
    try {
      const playerModel = this.levelController.playerField.playerModel;
      const enemyModel = this.levelController.enemyField.playerModel;

      if (playerModel.life <= 0) {
        this._matchStatistic?.loadStatistic("lose");
        this.levelController.showLoseView(true);
      }

      if (enemyModel.life <= 0) {
        this.levelController.showWinView(true);
        //   this._menuSelector?.openSectionMenu(this, "RewardBlock");
      }
    } catch (error) {
      if (IN_DEBUG()) console.error(error);
    }

  }

  public skipBotTurn(skip = true) {
    this._needToSkipBotTurn = skip;
  }

  private startBotTurn() {
    this._gameState.isPlayerTurn = false;

    this._bot?.move();
  }

  private countAttackingTiles(
    tileNameToAttack: string,
    ...tags: string[]
  ): number {
    const tiles = this._fieldAnalizer.getAttackingTiles(
      tileNameToAttack,
      this._cardService?.getCurrentPlayerModel(),
      ...tags
    );

    const res = tiles.reduce((sum, current) => sum + current.attackPower, 0);
    return res;
  }

  private notifyTilesAboutEndOfTurn() {
    this.forAllNotDestroiedTiles((t) => t.turnEnds());

    this.fakeTiles.forEach((t) => t.turnEnds());
  }

  private notifyTilesAboutStartOfTurn() {
    this.forAllNotDestroiedTiles((t) => t.turnBegins());

    this.fakeTiles.forEach((t) => t.turnBegins());
  }

  private notifyTilesToAnimateEndOfTurn() {
    this.forAllNotDestroiedTiles((t) => t.turnBeginsAnimation());
  }

  private notifyTilesToAnimateStartOfTurn() {
    this.forAllNotDestroiedTiles((t) => t.turnEndsAnimation());
  }

  private forAllNotDestroiedTiles(action: (tile: TileController) => void) {
    this._field.fieldMatrix
      .filter(() => true)
      .forEach((t) => {
        if (!t.isDestroied) {
          try {
            action(t);
          } catch (error) {
            if (IN_DEBUG()) console.error(error);
          }
        }
      });
  }

  public endTurn() {
    this._eotInvoker.endTurn();
  }

  protected update(dt: number): void {
    this._eotInvoker.update();
  }
}
