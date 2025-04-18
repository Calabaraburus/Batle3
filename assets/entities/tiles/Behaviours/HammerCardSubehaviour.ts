import {
  randomRange,
  randomRangeInt,
  tween,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { IAttackable, isIAttackable } from "../IAttackable";
import { AnimationEffect } from "../../effects/AnimationEffect";

export class HammerCardSubehaviour extends CardsSubBehaviour {
  private _tilesToDestroy: TileController[] = [];
  private _colTilesToDestroy: TileController[] = [];
  private _cache: ObjectsCache | null;
  protected powerCard = 2;
  private _targetTile: StdTileController;

  prepare(): boolean {
    let maxCountLength = this.powerCard;
    let maxCountLengthBot = 0;
    const maxCountForRow = 1;
    this._targetTile = this.parent.target as StdTileController;

    if (
      this.parent.cardService.getCurrentPlayerModel() ==
      this.parent.botModel
    ) {
      maxCountLength = 0;
      maxCountLengthBot = this.powerCard;
    }

    if (this._targetTile instanceof StdTileController) {
      if (
        this._targetTile.playerModel ==
        this.parent.currentPlayerModel
      ) {
        return false;
      }
    } else {
      return false;
    }

    const matrix = this.parent.field?.fieldMatrix;
    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 0.8;
    this._tilesToDestroy = [];
    this._colTilesToDestroy = [];

    this.parent.field?.fieldMatrix.forEachCol(
      this._targetTile.col,
      (tile, rowId) => {
        if (this.parent.cardService == null) return;
        if (
          tile.playerModel == this.parent.currentOponentModel
        ) {
          if (
            this._targetTile.row + maxCountLength >= rowId &&
            this._targetTile.row - maxCountLengthBot <= rowId
          ) {
            this._colTilesToDestroy.push(tile);
          }
        }
      }
    );

    this._colTilesToDestroy.forEach((tile) => {
      this._tilesToDestroy.push(tile);
      const coords = [-1, 1];
      coords.forEach((item) => {
        const tileToDestroy = matrix?.get(tile.row, tile.col + item);
        if (!tileToDestroy) return;
        if (this.parent.cardService == null) return;
        if (
          tileToDestroy.playerModel == this.parent.currentOponentModel &&
          !tile.tileModel.serviceTile
        ) {
          this._tilesToDestroy.push(tileToDestroy);
        }
      });
    });

    return true;
  }

  run(): boolean {
    this._tilesToDestroy.forEach((tile) => {
      if (isIAttackable(tile)) {
        (<IAttackable>tile).attack(1);
      } else {
        tile.fakeDestroy();
      }
    });

    return true;
  }

  effect(): boolean {
    console.log("[hammer_cardsub] start effect");


    const fieldTransform = this.parent.effectsNode?.getComponent(UITransform);

    if (fieldTransform == null) {
      console.log("[hammer_cardsub][error] fieldTransform is null");
      return false;
    }

    const effects: CardEffect[] = [];

    const spareEffect =
      this._cache?.getObjectByPrefabName<AnimationEffect>("hammerEffect");

    if (spareEffect == null) {
      return false;
    }

    const startPos = this._targetTile.node.position.clone();

    startPos.y = fieldTransform.height * fieldTransform.anchorY;

    spareEffect.node.parent = null;
    spareEffect.node.parent = this.parent.effectsNode;
    spareEffect.node.position = startPos;
    spareEffect.play();

    this.parent.audioManager.playSoundEffect("hummer_1");

    const animator = tween(spareEffect.node);

    this._tilesToDestroy.forEach((t, i) => {
      const effect =
        this._cache?.getObjectByPrefabName<CardEffect>("firewallBlueEffect");
      if (effect == null) {
        return;
      }

      effect.node.position = t.node.position;
      effect.node.parent = this.parent.effectsNode;
      effect.stopEmmit();
      effects.push(effect);
    });

    animator
      .to(0.4, { position: this._targetTile.node.position })
      .call(() => effects.forEach((e) => e.play()))
      .delay(0.3)
      .call(() => {
        effects.forEach((e) => e.stopEmmit());
      })
      .delay(1)
      .call(() => {
        effects.forEach((e) => e.cacheDestroy());
        spareEffect.cacheDestroy();
      });

    animator.start();
    return true;
  }
}
