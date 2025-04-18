//  MineTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2023
//

import {
  _decorator,
  Sprite,
  Vec3,
  instantiate,
  Prefab,
  UITransform,
  randomRangeInt,
  tween,
  Node,
  CCFloat,
  math,
  director,
  assert
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { IAttackable, isIAttackable } from "../IAttackable";
import { GameManager } from "../../game/GameManager";
import { CardService } from "../../services/CardService";
import { PlayerModel } from "../../../models/PlayerModel";
import { FieldController } from "../../field/FieldController";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { EffectsService } from "../../services/EffectsService";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { Service } from "../../services/Service";
import { DataService } from "../../services/DataService";
import { EffectsManager } from "../../game/EffectsManager";
import { LifeIndicator_v2 } from "../LifeIndicator_v2";
import { loseLifeLabel } from "../../playerField/loseLifeEffect/loseLifeLabel";
import { TaskInfo } from "../../ui/taskInfo/TaskInfo";
import { MonkSummonerTileController } from "../MonkSummonerTile/MonkSummonerTileController";
import { SoulEffect } from "../../effects/soulEffect";
const { ccclass, property } = _decorator;

@ccclass("MonkTileController")
export class MonkTileController
  extends TileController
  implements IAttackable {
  private _cardService: CardService;
  private _state: TileState;
  private _gameManager: GameManager;

  private _dataService: DataService;
  private _fieldViewController: FieldController;
  private _effectsManager: EffectsManager;
  private _audio: AudioManagerService;
  private _curLife: number;
  private _prevAtack = false;

  @property(CCFloat)
  public Life: number = 6;
  private _lifeIndicator: LifeIndicator_v2 | null;
  private _created = true;
  private _lvlViewNode: Node;
  private _info: TaskInfo | null;

  private _summoner: MonkSummonerTileController;
  private _effectsService: EffectsService;

  start() {
    super.start();
    this.isFixed = true;
    this._cardService = Service.getServiceOrThrow(CardService);
    this._dataService = Service.getServiceOrThrow(DataService);
    this._gameManager = Service.getServiceOrThrow(GameManager);
    this._fieldViewController = Service.getServiceOrThrow(FieldController);
    this._effectsManager = Service.getServiceOrThrow(EffectsManager);
    this._effectsService = Service.getServiceOrThrow(EffectsService);
    this._audio = Service.getServiceOrThrow(AudioManagerService);
    this._lifeIndicator = this.getComponentInChildren(LifeIndicator_v2);

    this.loadLvlViewNode();
    this.updateSprite();
    this.setLife();
    this._created = true;
  }

  setSummoner(summoner: MonkSummonerTileController) {
    this._summoner = summoner;
  }

  setLife() {
    this._curLife = this.Life;

    if (this._lifeIndicator) {
      this._lifeIndicator.activeLifes = this.Life;
      this._lifeIndicator.maxLifes = this.Life;
    }
  }

  turnBegins(): void {
    if (this._created) {
      this._created = false;
    } else {

      if (this._cardService?.getCurrentPlayerModel() != this.playerModel) {
        this.moveMonk();
      } else {
        this.tryToAttackMonk();
      }
    }

    this.tryToChangeBckg();
    this._prevAtack = this.isInAtackZone();
  }

  turnEnds(): void {
    this.tryToChangeBckg();
    this._prevAtack = this.isInAtackZone();
  }

  tryToAttackMonk() {
    if (this.isInAtackZone()) {
      this.attack(1);
    }
  }

  isInAtackZone() {
    const nxt = this.fieldController.fieldMatrix.get(this.row + 1, this.col);
    const prev = this.fieldController.fieldMatrix.get(this.row > 1 ? this.row - 1 : this.row, this.col);

    if (nxt.playerModel != this.playerModel || prev.playerModel != this.playerModel) {
      return true;
    }

    return false;
  }

  moveMonk() {

    let vectorAttack = 1;

    if (this.playerModel == this._dataService.botModel) {
      vectorAttack = -1;
    }

    if ((this.row + vectorAttack) == this.fieldController.getEndTile(this.col)?.row) {
      this.destroyMonk();
      this.infoAboutSurvive();
      this.playSurviveEffect();
    } else {
      const matrix = this.fieldController.fieldMatrix;

      const aimTile = matrix.get(this.row + vectorAttack, this.col);

      if (!aimTile) {
        return;
      }

      this.exchangeTile(aimTile);

      this.fieldController.moveTilesLogicaly(this._gameManager.playerTurn);
      this.fieldController.fixTiles();

      this._effectsManager.PlayEffectNow(() => this.playMoveEffect(), 0.6)
    }
  }

  tryToChangeBckg() {
    const curAtack = this.isInAtackZone();
    if (curAtack != this._prevAtack) {
      if (curAtack) {
        this.setBackground("emergencyBackground");
      } else {
        this.setBackground("playerBackground");
      }
    }
  }

  destroyMonk() {
    this.fakeDestroy();

    this.fieldController.moveTilesLogicaly(this._gameManager.playerTurn);
    this.fieldController.fixTiles();
    this.playDestroyEffect();
  }

  exchangeTile(aimTile: TileController) {
    this.fieldController.exchangeTiles(aimTile, this);
  }

  public cacheCreate(): void {
    super.cacheCreate();

    this.setLife();

    this._created = true;
  }

  public setModel(tileModel: TileModel) {
    super.setModel(tileModel);

    this.setLife();

    this._created = true;
  }

  /** Attack this enemy with power.
   * @power Power.
   */
  public attack(power = 1) {
    this._curLife -= power;
    this._effectsManager.PlayEffectNow(() => this.playAttackEffect(), 0.6);

    if (this._curLife < 0) {
      this.destroyMonk();
      this.playDestroyEffect();
      this.infoAboutDth();
    } else {
      if (this._lifeIndicator) {
        this._lifeIndicator.activeLifes = this._curLife;
      }
    }
  }

  playAttackEffect() {
    if (this.isDestroied) return;

    console.log("monk attack effect");

    const cache = ObjectsCache.instance;
    if (cache == null) return;

    this._audio.playSoundEffect("hitSound4");

    const label = cache.getObjectByName<loseLifeLabel>("loseLifeLabel");
    if (label) {
      label.node.parent = null;
      label.node.parent = this._lvlViewNode;
    }
    const pos = this.node.worldPosition.clone();
    pos.x += math.randomRange(-50, 50);
    pos.y += math.randomRange(-50, 50);
    label?.play(-1, pos);
  }

  infoAboutDth() {
    this._summoner.informAboutMonkDeath();
  }

  infoAboutSurvive() {
    this._summoner.informAboutMonkSurvive();
  }

  playDestroyEffect() {
    this.node.active = false;
    this._fieldViewController.moveTilesAnimate();

    const effect =
      ObjectsCache.instance?.getObjectByPrefabName<CardEffect>("TilesCrushEffect");

    if (effect == null) {
      return;
    }

    effect.node.parent = null;
    effect.node.parent = this.node.parent;
    effect.node.position = this.node.position.clone();
    effect.play();

    const animator = tween(this);
    animator
      .delay(2)
      .call(() => effect.cacheDestroy());

    animator.start();
  }

  playSurviveEffect() {
    const soulEffect =
      ObjectsCache.instance?.getObjectByPrefabName<SoulEffect>("tileSoulEffect");

    if (soulEffect) {

      this._audio.playSoundEffect("monkSurvive");

      soulEffect.node.parent = this._effectsService.effectsNode;
      soulEffect.node.worldPosition = this.node.worldPosition;

      const aim = this.dataService.enemyFieldController?.playerImage.node;

      soulEffect?.playSoul(aim, () => { });
    }
  }

  playMoveEffect() {
    this._fieldViewController.moveTilesAnimate();
  }

  loadLvlViewNode() {
    const tlvlViewNode = director.getScene()?.getChildByName("LevelView");
    if (tlvlViewNode) {
      this._lvlViewNode = tlvlViewNode;
    }
  }
}
