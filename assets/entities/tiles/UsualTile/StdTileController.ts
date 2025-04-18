//  StdTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  _decorator,
  Sprite,
  SpriteFrame,
  Vec3,
  instantiate,
  Prefab,
  UITransform,
  Node,
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { CardService } from "../../services/CardService";
import { Service } from "../../services/Service";
const { ccclass, property } = _decorator;

@ccclass("StdTileController")
export class StdTileController extends TileController {
  private _curSprite: Sprite | null;
  private _state: TileState;
  private _shieldIsActivated: boolean;

  /** Destroy particle system */
  //  @property(Prefab)
  // destroyPartycles: Prefab;

  @property(Node)
  shieldSprite: Node;
  private _cardService: CardService | null;

  get shieldIsActivated() {
    return this._shieldIsActivated;
  }

  public get virtual() {
    return super.virtual;
  }

  public set virtual(value: boolean) {
    super.virtual = value;

    if (!value) {
      this.activateShield(this._shieldIsActivated);
    }
  }

  start() {
    super.start();

    this._cardService = Service.getService(CardService);
  }

  public get state(): TileState {
    return this._state;
  }

  public activateShield(activate: boolean) {
    this._shieldIsActivated = activate;
    if (!this.virtual) this.shieldSprite.active = activate;
  }

  public cacheCreate(): void {
    super.cacheCreate();

    this.activateShield(false);
  }

  turnEnds(): void {
    if (
      this._shieldIsActivated &&
      this._cardService?.getOponentModel() == this.playerModel
    ) {
      this.activateShield(false);
    }
  }
}
