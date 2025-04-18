//  StdTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, Sprite, Vec3, instantiate, Prefab, UITransform, assert, CCFloat } from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { IAttackable } from "../IAttackable";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { Service } from "../../services/Service";
import { LifeIndicator } from "../LifeIndicator";
import { LifeIndicator_v2 } from "../LifeIndicator_v2";
const { ccclass, property } = _decorator;

@ccclass("TotemTileController")
export class TotemTileController extends TileController implements IAttackable {
  private _curSprite: Sprite | null;
  private _state: TileState;
  private _attacksCountToDestroy: number;
  private _attackedNumber: number;
  private _audio: AudioManagerService | null = null;
  private _lifeIndicator: LifeIndicator_v2 | null

  /** Destroy particle system */
  @property(Prefab)
  destroyPartycles: Prefab;

  @property(CCFloat)
  power = 2;

  @property(CCFloat)
  lifeAmount = 1;

  get attacksCountToDestroy() {
    return this._attacksCountToDestroy;
  }

  start() {
    super.start();
    this.updateSprite();

    this._lifeIndicator = this.getComponentInChildren(LifeIndicator_v2);

    this.setLife();
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
    if (this._lifeIndicator) {
      this._lifeIndicator.activeLifes = this.lifeAmount;
      this._lifeIndicator.maxLifes = this.lifeAmount;
    }

    this._attacksCountToDestroy = this.lifeAmount;
    this._attackedNumber = this.attacksCountToDestroy;
  }

  /** Attack this enemy with power.
   * @power Power.
   */
  public attack() {
    if (this._attackedNumber > 0) {
      this._attackedNumber -= this.power;

      if (this._lifeIndicator)
        this._lifeIndicator.activeLifes = this._attackedNumber;

      if (this._attackedNumber <= 0) {
        this.fakeDestroy();
        this.node.active = false;
      }
    }
  }

  public fakeDestroy() {
    this.createParticles();
    this.playSoundEffect();
    super.fakeDestroy();
  }

  private playSoundEffect() {
    if (!this._audio) {
      this._audio = Service.getService(AudioManagerService);
    }

    this._audio?.playSoundEffect("totem_attack");
  }

  private createParticles() {
    const ps = instantiate(this.destroyPartycles);
    ps.parent = this.node.parent;
    const ui = this.getComponent(UITransform);

    if (ui == null) {
      return;
    }

    ps.position = new Vec3(
      this.node.position.x + ui.contentSize.width / 2,
      this.node.position.y + ui.contentSize.height / 2,
      this.node.position.z
    );
  }
}
