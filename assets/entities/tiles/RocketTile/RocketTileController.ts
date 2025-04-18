//  RocketTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, randomRangeInt, Node } from "cc";
import { TileController } from "../TileController";
const { ccclass, property } = _decorator;

@ccclass("RocketTileController")
export class RocketTileController extends TileController {
  /** Vertical sprite */
  @property(Node)
  RocketVNode: Node;

  /** Horizontal sprite */
  @property(Node)
  RocketHNode: Node;

  private _isVertical: boolean;
  public set isVertical(value: boolean) {
    this._isVertical = value;

    if (value) {
      this.RocketVNode.active = true;
    } else {
      this.RocketHNode.active = true;
    }
  }

  public get isVertical() {
    return this._isVertical;
  }

  public destroyTile() {
    super.fakeDestroy();
    this.RocketVNode.active = false;
    this.RocketHNode.active = false;
  }

  start() {
    this.isVertical = Boolean(randomRangeInt(0, 2));
  }
}
