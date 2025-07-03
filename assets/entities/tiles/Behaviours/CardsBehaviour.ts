/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { tween, _decorator, Node, director, assert } from "cc";
import { PlayerModel } from "../../../models/PlayerModel";
import { helpers } from "../../../scripts/helpers";
import { GameBehaviour } from "../../behaviours/GameBehaviour";
import { CardService } from "../../services/CardService";
import { StdTileController } from "../UsualTile/StdTileController";
import { BodyExchangeCardSubehaviour } from "./BodyExchangeCardSubehaviour";
import { CounterattackCardSubehaviour } from "./CounterattackCardSubehaviour";
import { FirewallCardSubehaviour } from "./FirewallCardSubehaviour";
import { FirewallLowCardSubehaviour } from "./FirewallLowCardSubehaviour";
import { FirewallMiddleCardSubehaviour } from "./FirewallMiddleCardSubehaviour";
import { ISubBehaviour } from "./ISubBehaviour";
import { LightningCardSubehaviour } from "./LightningCardSubehaviour";
import { LightningLowCardSubehaviour } from "./LightningLowCardSubehaviour";
import { LightningMiddleCardSubehaviour } from "./LightningMiddleCardSubehaviour";
import { MeteoriteCardSubehaviour } from "./MeteoriteCardSubehaviour";
import { MeteoriteLowCardSubehaviour } from "./MeteoriteLowCardSubehaviour";
import { MeteoriteMiddleCardSubehaviour } from "./MeteoriteMiddleCardSubehaviour";
import { PanicCardSubehaviour } from "./PanicCardSubehaviour";
import { PushCardSubehaviour } from "./PushCardSubehaviour";
import { RecruitEnemyCardSubehaviour } from "./RecruitEnemyCardSubehaviour";
import { MineCardSubehaviour } from "./MineCardSubehaviour";
import { ShieldCardSubehaviour } from "./shieldCardBehave";
import { TeleportCardSubehaviour } from "./TeleportCardSubehaviour";
import { TotemCardSubehaviour } from "./TotemCardSubehaviour";
import { WormCardSubehaviour } from "./WormCardSubehaviour";
import { WormLowCardSubehaviour } from "./WormLowCardSubehaviour";
import { WormMiddleCardSubehaviour } from "./WormMiddleCardSubehaviour";
import { CatapultCardSubehaviour } from "./CatapultCardSubehaviour";
import { AssassinCardSubehaviour } from "./AssassinCardSubehaviour";
import { ShamanCardSubehaviour } from "./ShamanCardSubehaviour";
import { EffectsService } from "../../services/EffectsService";
import { ManeuverCardSubehaviour } from "./ManeuverCardSubehaviour";
import { HammerCardSubehaviour } from "./HammerCardSubehaviour";
import { PikeCardSubehaviour } from "./PikeCardSubehaviour";
import { BerserkCardSubehaviour } from "./BerserkCardSubehaviour";
import { HammerLowCardSubehaviour } from "./HammerLowCardSubehaviour";
import { HammerMiddleCardSubehaviour } from "./HammerMiddleCardSubehaviour";
import { PikeLowCardSubehaviour } from "./PikeLowCardSubehaviour";
import { PikeMiddleCardSubehaviour } from "./PikeMiddleCardSubehaviour";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { DataService } from "../../services/DataService";
import { LevelModel } from "../../../models/LevelModel";
import { GameState } from "../../game/GameState";
import { EffectsManager } from "../../game/EffectsManager";
import { EOTInvoker } from "../../game/EOTInvoker";
import { TileController } from "../TileController";
import { FieldControllerExtensions } from "../../field/FieldExtensions";
import { Behaviour } from "../../behaviours/Behaviour";
import { CardsSubBehaviour } from "./SubBehaviour";
import { AssassinLowCardSubehaviour } from "./AssassinLowCardSubehaviour";
import { BerserkLowCardSubehaviour } from "./BerserkLowCardSubehaviour";
import { CatapultLowCardSubehaviour } from "./CatapultLowCardSubehaviour";
import { ShamanLowCardSubehaviour } from "./ShamanLowCardSubehaviour";
import { TotemLowCardSubehaviour } from "./TotemLowCardSubehaviour";
import { MineLowCardSubehaviour } from "./MineLowCardSubehaviour";
const { ccclass } = _decorator;

@ccclass("CardsBehaviour")
export class CardsBehaviour extends GameBehaviour {
  private _cardsRunDict = new Map<string, ISubBehaviour>();
  private _effectsNode: Node | null;
  private _startTilesP1: TileController[];
  private _startTilesP2: TileController[];

  public get effectsNode(): Node | null {
    return this._effectsNode;
  }

  public get startTilesP1() {
    return this._startTilesP1;
  }

  public get startTilesP2() {
    return this._startTilesP2;
  }

  public applyCardsLogicOnly = false;

  constructor() {
    super();
    this.type = helpers.typeName(StdTileController);

    // Firewall cards
    this._cardsRunDict.set("firewallLow", new FirewallLowCardSubehaviour(this));
    this._cardsRunDict.set(
      "firewallMiddle",
      new FirewallMiddleCardSubehaviour(this)
    );
    this._cardsRunDict.set("firewall", new FirewallCardSubehaviour(this));

    // Lightning cards
    this._cardsRunDict.set(
      "lightningLow",
      new LightningLowCardSubehaviour(this)
    );
    this._cardsRunDict.set(
      "lightningMiddle",
      new LightningMiddleCardSubehaviour(this)
    );
    this._cardsRunDict.set("lightning", new LightningCardSubehaviour(this));

    this._cardsRunDict.set("shield", new ShieldCardSubehaviour(this));
    this._cardsRunDict.set("totem", new TotemCardSubehaviour(this));
    this._cardsRunDict.set("totemLow", new TotemLowCardSubehaviour(this));

    // Mine card
    this._cardsRunDict.set("mine", new MineCardSubehaviour(this));

    // MineLow card
    this._cardsRunDict.set("mineLow", new MineLowCardSubehaviour(this));

    // Bodyexchange card
    this._cardsRunDict.set(
      "bodyExchange",
      new BodyExchangeCardSubehaviour(this)
    );

    // Metiorite cards
    this._cardsRunDict.set(
      "meteoriteLow",
      new MeteoriteLowCardSubehaviour(this)
    );
    this._cardsRunDict.set(
      "meteoriteMiddle",
      new MeteoriteMiddleCardSubehaviour(this)
    );
    this._cardsRunDict.set("meteorite", new MeteoriteCardSubehaviour(this));

    // Worm cards
    this._cardsRunDict.set("wormLow", new WormLowCardSubehaviour(this));
    this._cardsRunDict.set("wormMiddle", new WormMiddleCardSubehaviour(this));
    this._cardsRunDict.set("worm", new WormCardSubehaviour(this));

    // Hammer card
    this._cardsRunDict.set("hammer", new HammerCardSubehaviour(this));
    this._cardsRunDict.set("hammerLow", new HammerLowCardSubehaviour(this));
    this._cardsRunDict.set(
      "hammerMiddle",
      new HammerMiddleCardSubehaviour(this)
    );

    // Pike card
    this._cardsRunDict.set("pike", new PikeCardSubehaviour(this));
    this._cardsRunDict.set("pikeLow", new PikeLowCardSubehaviour(this));
    this._cardsRunDict.set("pikeMiddle", new PikeMiddleCardSubehaviour(this));

    // Catapult card
    this._cardsRunDict.set("catapult", new CatapultCardSubehaviour(this));

    // CatapultLow card
    this._cardsRunDict.set("catapultLow", new CatapultLowCardSubehaviour(this));

    // Assassin card
    this._cardsRunDict.set("assassin", new AssassinCardSubehaviour(this));

    // Assassin Low card
    this._cardsRunDict.set("assassinLow", new AssassinLowCardSubehaviour(this));

    // Shaman card
    this._cardsRunDict.set("shaman", new ShamanCardSubehaviour(this));

    // ShamanLow card
    this._cardsRunDict.set("shamanLow", new ShamanLowCardSubehaviour(this));

    // Panic card
    this._cardsRunDict.set("panic", new PanicCardSubehaviour(this));

    // Maneuver card
    this._cardsRunDict.set("maneuver", new ManeuverCardSubehaviour(this));

    // Teleport card
    this._cardsRunDict.set("teleport", new TeleportCardSubehaviour(this));

    // Counterattack card
    this._cardsRunDict.set("c_attack", new CounterattackCardSubehaviour(this));

    // RecruitEnemy card
    this._cardsRunDict.set("recruit", new RecruitEnemyCardSubehaviour(this));

    // Push card
    this._cardsRunDict.set("push", new PushCardSubehaviour(this));

    // Berserk card
    this._cardsRunDict.set("berserk", new BerserkCardSubehaviour(this));

    // BerserkLow card
    this._cardsRunDict.set("berserkLow", new BerserkLowCardSubehaviour(this));
  }

  // start() {

  // }

  activateCondition(): boolean {
    const model = this.currentPlayerModel;
    return model != null ? model.isBonusSet() : false;
  }

  singleRun(): void {
    if (this.target == undefined) {
      throw Error("[behaviour][cardsBehaviour] tile cant be undefined");
    }
    this.debug?.log("[behaviour][cardsBehaviour] cardsSingleRun");
    this._inProcess = true;
    const model = this.currentPlayerModel;
    const mnemonic = model?.activeBonus?.mnemonic;
    if (mnemonic == null) return;

    if (this._cardsRunDict.has(mnemonic)) {
      const subBehave = this._cardsRunDict.get(mnemonic);

      if (subBehave != undefined) {
        if (subBehave.prepare()) {
          subBehave.run();

          if (this.applyCardsLogicOnly) {
            this.cancel();
          } else {
            this.effectsManager
              .PlayEffectNow(() => subBehave.effect(), subBehave.effectDuration)
              .PlayEffect(() => this.afterEffect(), 0.4);

            this.finalize();

            /*   tween(this)
                 .delay(subBehave.effectDuration)
                 .call(() => {
                   if (subBehave.run()) {
                   
                   }
                 })
                 .start();*/
          }
        } else {
          this.cancel();
        }
      } else {
        this.cancel();
      }
    } else {
      this.cancel();
    }
  }

  cancel(): void {
    this._inProcess = false;
  }

  afterEffect(): void {
    this.updateTileField();
  }

  finalize(): void {
    const model = this.cardService.getCurrentPlayerModel();

    if (model != null) {
      this.payCardPrice(model);
      model.activeBonus!.alreadyUsedOnTurn = true;
      this.deactivateBonusWithModel(model);
      this.cardService.updateBonusesActiveState();
      this.levelController.updateData();
    }

    //    this.levelController?.updateData();

    // this.updateTileField();
    this._inProcess = false;
  }

  private updateTileField() {
    const analizedData = this.fieldAnalizer?.analyze();

    if (analizedData != null) {
      this.field.moveTilesLogicaly(!this.gameState.isPlayerTurn);
      this.field.fixTiles();
      this.field.flush();
      this.fieldViewController.moveTilesAnimate();
    }
  }

  payCardPrice(model: PlayerModel): void {
    const curPlayer = this.currentPlayerModel;
    if (curPlayer == null) return;
    if (model.activeBonus == null) return;

    // game mechanic 0
    curPlayer.manaCurrent -= model.activeBonus.priceToActivate;

    // game mechanic 1
    model.activeBonus.currentAmmountToActivate -=
      model.activeBonus.priceToActivate;
  }

  deactivateBonus() {
    const model = this.currentPlayerModel;

    if (model != null) {
      this.deactivateBonusWithModel(model);
    }
  }

  deactivateBonusWithModel(model: PlayerModel) {
    model.unSetBonus();
  }

  public Setup(
    objectsCache: ObjectsCache,
    cardService: CardService,
    dataService: DataService,
    levelModel: LevelModel,
    gameState: GameState,
    effectsService: EffectsService,
    effectsManager: EffectsManager,
    audioManager: AudioManagerService,
    eotInvoker: EOTInvoker
  ) {
    super.Setup(
      objectsCache,
      cardService,
      dataService,
      levelModel,
      gameState,
      effectsService,
      effectsManager,
      audioManager,
      eotInvoker
    );

    this._effectsNode = this.effectsService.effectsNode;

    if (dataService.field != null) {
      const fieldExt = new FieldControllerExtensions(dataService.field);

      this._startTilesP1 = fieldExt.findTilesByModelName("start");
      this._startTilesP2 = fieldExt.findTilesByModelName("end");
    }
  }

  clone(): Behaviour {
    const result = new CardsBehaviour();
    this.cloneInternal(result);

    this._cardsRunDict.forEach((v, k) => {
      const clonedV = v.clone();
      if (clonedV instanceof CardsSubBehaviour) {
        clonedV.parent = result;
      }
      result._cardsRunDict.set(k, clonedV);
    });

    result.applyCardsLogicOnly = this.applyCardsLogicOnly;
    return result;
  }
}
