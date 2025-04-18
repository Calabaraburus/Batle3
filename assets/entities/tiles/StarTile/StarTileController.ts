//  StarTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, Sprite } from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
const { ccclass, property } = _decorator;

@ccclass("StarTileController")
export class StarTileController extends TileController {
  private _modelCF: TileModel;

  /** Sprite with texture */
  @property(Sprite)
  starSprite: Sprite;

  get modelCreatedFrom(): TileModel {
    return this._modelCF;
  }

  public createdForm(model: TileModel) {
    this._modelCF = model;
    this.starSprite.color = model.starColor;
  }

  public fakeDestroy() {
    super.fakeDestroy();
    this.starSprite.spriteFrame = null;
  }
}
