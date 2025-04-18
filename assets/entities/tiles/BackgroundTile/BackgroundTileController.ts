import {
  _decorator,
  Component,
  Node,
  SpriteFrame,
  Sprite,
  ValueType,
  random,
  randomRangeInt,
} from "cc";
import { TileModel } from "../../../models/TileModel";
import { CacheObject } from "../../../ObjectsCache/CacheObject";
import { TileController } from "../TileController";
const { ccclass, property } = _decorator;

@ccclass("BackgroundTileController")
export class BackgroundTileController extends CacheObject {
  private _sprite: Sprite | null;
  private _tileModel: TileModel | null = null;
  private _prevType = "";

  public get tileModel(): TileModel | null {
    return this._tileModel;
  }

  public set tileModel(tileModel: TileModel | null) {
    this._tileModel = tileModel;
  }

  start() {
    this.ChckForSprite();
  }

  public SetTypeBasedOnForegroundTile(
    tileController: TileController,
    setAll = false
  ): void {
    if (
      this._prevType != "" &&
      tileController.tileModel.containsTag(this._prevType)
    ) {
      return;
    }

    tileController.tileModel.getTags().forEach((t) => {
      if (this.SetType(t)) {
        if (!setAll) {
          this._prevType = t;
          return;
        }
      }
    });
  }

  public SetType(tag: string): boolean {
    if (tag == "") return false;
    this.ChckForSprite();

    if (this._sprite != null) {
      const sprites = this._tileModel?.additionalSprites.filter((as) =>
        as.name.includes("#" + tag)
      );
      if (sprites != null) {
        const sprite = sprites[randomRangeInt(0, sprites?.length)];

        if (sprite != null) {
          this._sprite.spriteFrame = sprite.sprite;
          return true;
        }
      }
    }

    return false;
  }

  private ChckForSprite() {
    if (this._sprite == null) {
      this._sprite = this.getComponentInChildren(Sprite);
    }
  }
}
