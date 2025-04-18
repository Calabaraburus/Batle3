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
import { ReadonlyMatrix2D } from "../../field/ReadonlyMatrix2D";
import { AnimationEffect } from "../../effects/AnimationEffect";

export class PikeCardSubehaviour extends CardsSubBehaviour {
  private _tilesToDestroy: TileController[] = [];
  private _colTilesToDestroy: TileController[] = [];
  private _cache: ObjectsCache | null;
  protected powerCard = 2;
  protected coordsCol = [
    [-2, -1, 1, 2],
    [-1, 1],
    [0, 0],
  ];
  private _targetTile: StdTileController;

  prepare(): boolean {
    let maxCountLength = this.powerCard;
    let maxCountLengthBot = 0;
    const coords = this.coordsCol.slice();
    this._targetTile = this.parent.target as StdTileController;

    if (
      this.parent.cardService.getCurrentPlayerModel() ==
      this.parent.botModel
    ) {
      maxCountLength = 0;
      maxCountLengthBot = this.powerCard;
      coords.reverse();
    }

    if (this._targetTile instanceof StdTileController) {
      if (
        this._targetTile.playerModel ==
        this.parent.cardService.getCurrentPlayerModel()
      ) {
        return false;
      }
    } else {
      return false;
    }

    const matrix = this.parent.field?.fieldMatrix;
    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 1.5;
    this._tilesToDestroy = [];
    this._colTilesToDestroy = [];

    this.parent.field?.fieldMatrix.forEachCol(
      this._targetTile.col,
      (tile, rowId) => {
        if (
          tile.playerModel == this.parent.cardService.getOponentModel()
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

    // let coords = [
    //   [-2, -1, 1, 2],
    //   [-1, 1],
    //   [0, 0],
    // ];

    // if (maxCountLength == 2 || maxCountLengthBot == 2) {
    //   coords = [
    //     [-2, -1, 1, 2],
    //     [-1, 1],
    //     [0, 0],
    //   ];
    // } else if (maxCountLength == 1 || maxCountLengthBot == 1) {
    //   coords = [
    //     [-1, 1],
    //     [0, 0],
    //   ];
    // } else {
    //   coords = [[0, 0]];
    // }

    for (let index = 0; index < this._colTilesToDestroy.length; index++) {
      this._tilesToDestroy.push(this._colTilesToDestroy[index]);
      this.getRowTiles(coords[index], this._colTilesToDestroy[index], matrix);
    }

    return true;
  }

  private getRowTiles(
    coords: number[],
    tile: TileController,
    matrix: ReadonlyMatrix2D<TileController> | undefined
  ) {
    coords.forEach((item) => {
      const tileToDestroy = matrix?.get(tile.row, tile.col + item);
      if (tile == tileToDestroy) return;
      if (!tileToDestroy) return;
      if (
        tileToDestroy.playerModel == this.parent.cardService.getOponentModel() &&
        !tileToDestroy.tileModel.serviceTile
      ) {
        this._tilesToDestroy.push(tileToDestroy);
      }
    });
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
    console.log("[pike_cardsub] start effect");

    const fieldTransform = this.parent.effectsNode?.getComponent(UITransform);

    if (fieldTransform == null) {
      console.log("[pike_cardsub][error] fieldTransform is null");
      return false;
    }

    const effects: CardEffect[] = [];

    const spareEffect =
      this._cache?.getObjectByPrefabName<AnimationEffect>("spareEffect");

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
        this._cache?.getObjectByPrefabName<CardEffect>("firewallEffect");
      if (effect == null) {
        return;
      }

      effect.node.position = t.node.position;
      effect.node.parent = this.parent.effectsNode;
      effect.stopEmmit();
      effects.push(effect);
    });

    animator
      .to(0.5, { position: this._targetTile.node.position })
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
