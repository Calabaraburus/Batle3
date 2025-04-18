//  MineTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2023
//

import {
  _decorator,
  Sprite,
  tween,
  Node,
  error,
  assert,
  UITransform,
  CCInteger,
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { IAttackable } from "../IAttackable";
import { CardService } from "../../services/CardService";
import { EffectsService } from "../../services/EffectsService";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { BalistaCardEffect } from "../../effects/BalistaCardEffect";
import { DataService } from "../../services/DataService";
import { LevelView } from "../../level/LevelView";
import { PlayerModel } from "../../../models/PlayerModel";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { Service } from "../../services/Service";
import { EffectsManager } from "../../game/EffectsManager";
import { LifeIndicator_v2 } from "../LifeIndicator_v2";
const { ccclass, property } = _decorator;

@ccclass("CatapultTileController")
export class CatapultTileController
  extends TileController
  implements IAttackable {
  @property(CCInteger)
  damageLife = 5;

  @property(CCInteger)
  life = 1;

  private _cardService: CardService;
  private _state: TileState;
  private _attackedNumber: number;
  private _effectsService: EffectsService;
  private _cache: ObjectsCache;
  private _dataService: DataService;
  private _aimForEffect: Node;
  private _effectsManager: EffectsManager;
  private _audioService: AudioManagerService;
  private _lifeIndicator: LifeIndicator_v2 | null;
  private _audio: AudioManagerService;

  start(): void {
    super.start();
    this.prepare();
    this.prepareForEffect();
    this.rotateToEnemy(this._aimForEffect);
  }

  prepare() {
    this._cardService = Service.getServiceOrThrow(CardService);
    this._effectsService = Service.getServiceOrThrow(EffectsService);
    this._effectsManager = Service.getServiceOrThrow(EffectsManager);
    this._audioService = Service.getServiceOrThrow(AudioManagerService);
    this._lifeIndicator = this.getComponentInChildren(LifeIndicator_v2);
    this._audio = Service.getServiceOrThrow(AudioManagerService);

    this.setLife();

    assert(ObjectsCache.instance != null, "Cache can't be null");
    this._cache = ObjectsCache.instance;
    this._dataService = Service.getServiceOrThrow(DataService);
  }

  rotateToEnemy(enemy: Node) {
    // const dir = enemy.position.clone().subtract(this.node.position).y;

    const foregroundNode = this.node.getChildByName("Foreground");

    if (foregroundNode == null) throw Error("Foreground node is null");

    foregroundNode.angle = this.playerModel == this._dataService?.playerModel ? 0 : 180;

  }

  turnBegins(): void {
    const damageModel = this._cardService?.getCurrentPlayerModel();

    if (this._cardService?.getCurrentPlayerModel() != this.playerModel) {
      if (damageModel || damageModel != null) {

        this._effectsManager.PlayEffectNow(() => this.playEffect(), 1.2);

        this._audioService.playSoundEffect("catapult_attack");

        damageModel.life = damageModel.life - this.damageLife;
      }
    }
  }

  public get state(): TileState {
    return this._state;
  }

  public setModel(tileModel: TileModel) {
    super.setModel(tileModel);

    this.setLife();
  }

  public cacheCreate(): void {
    super.cacheCreate();

    this.setLife();
  }

  setLife() {
    this._attackedNumber = this.life;
    if (this._lifeIndicator) {
      this._lifeIndicator.activeLifes = this.life;
      this._lifeIndicator.maxLifes = this.life;
    }
  }

  /** Attack this enemy with power.
   * @power Power.
   */
  public attack(power = 1) {
    if (this._attackedNumber > 0) {
      this._attackedNumber -= power;

      if (this._lifeIndicator)
        this._lifeIndicator.activeLifes = this._attackedNumber;

      if (this._attackedNumber <= 0) {
        this.fakeDestroy();
        this.node.active = false;
      }
    }
  }

  prepareForEffect() {
    if (this._aimForEffect != null) return;

    const tmpAim =
      this.playerModel == this._dataService?.playerModel
        ? this._dataService?.enemyFieldController?.playerImage.node
        : this._dataService?.playerFieldController?.playerImage.node;

    if (tmpAim == null) {
      throw Error("catapult effect aim is null");
    }

    this._aimForEffect = tmpAim;
  }

  playEffect() {
    this.prepareForEffect();

    const effect =
      this._cache?.getObjectByName<BalistaCardEffect>("BalistaCardEffect");

    if (effect != null) {
      effect.node.position = this.node.position;
      effect.node.parent =
        this._effectsService != null ? this._effectsService?.effectsNode : null;

      effect.aim = this._aimForEffect;

      const transform = effect.node.parent?.getComponent(UITransform);

      effect.play();

      this._audio.playSoundEffect(
        "catapult_attack"
      );

      const animator = tween(effect.node);

      animator
        .to(0.8, {
          position: transform?.convertToNodeSpaceAR(
            this._aimForEffect.worldPosition
          ),
        })
        .delay(0.8)
        .call(() => effect.stopEmmit())
        .delay(1)
        .call(() => effect.cacheDestroy());

      animator.start();
    }
  }
}


