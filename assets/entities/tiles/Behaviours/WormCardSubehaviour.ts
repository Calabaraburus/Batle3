import { randomRangeInt, tween, Vec2 } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { lightning } from "../../effects/lightning";
import { Line } from "../../effects/Line";
import { FieldController } from "../../field/FieldController";
import { ReadonlyMatrix2D } from "../../field/ReadonlyMatrix2D";
import { CardService } from "../../services/CardService";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { IAttackable, isIAttackable } from "../IAttackable";

export class WormCardSubehaviour extends CardsSubBehaviour {
  protected maxCount = 7;
  private _tilesToDestroy: TileController[] = [];
  private _cache: ObjectsCache | null;
  // protected powerCard = 2;

  prepare(): boolean {
    // const maxCountForEachSide = this.powerCard;
    const targetTile = this.parent.target as StdTileController;
    const playerTag = this.parent.cardService.getPlayerTag();
    if (playerTag == null) return false;
    if (this.parent.cardService == null) return false;

    if (targetTile instanceof StdTileController) {
      if (
        targetTile.playerModel ==
        this.parent.cardService.getCurrentPlayerModel()
      ) {
        return false;
      }
    } else {
      return false;
    }

    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 1;
    this._tilesToDestroy = [];

    let currentTile: TileController = targetTile;
    this._tilesToDestroy.push(currentTile);
    const matrix = this.parent.field?.fieldMatrix;
    if (matrix == null) return false;

    for (let index = 0; index < this.maxCount - 1; index++) {
      const applicantsToDestroy: TileController[] = [];

      const ids = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      ids.forEach((i) =>
        this.getNearTile(
          matrix,
          applicantsToDestroy,
          currentTile.row + i[0],
          currentTile.col + i[1]
        )
      );

      if (applicantsToDestroy.length == 0) return true;
      currentTile =
        applicantsToDestroy[randomRangeInt(0, applicantsToDestroy.length)];
      if (!currentTile.tileModel.serviceTile) {
        this._tilesToDestroy.push(currentTile);
      }
    }

    return true;
  }

  private getNearTile(
    matrix: ReadonlyMatrix2D<TileController>,
    applicantsToDestroy: TileController[],
    row: number,
    col: number
  ) {
    if (row < matrix.rows && col < matrix.cols && row >= 0 && col >= 0) {
      const tile = matrix?.get(row, col);
      if (tile.playerModel == this.parent.cardService.getOponentModel()) {
        if (!this._tilesToDestroy.some((t) => t == tile))
          applicantsToDestroy.push(tile);
      }
    }
  }

  run(): boolean {
    this._tilesToDestroy.forEach((item) => {
      if (isIAttackable(item)) {
        (<IAttackable>item).attack(1);
      } else {
        this.parent.field?.fakeDestroyTile(item);
      }
    });

    return true;
  }

  effect(): boolean {
    console.log("fire wall effect");
    const timeObj = { time: 0 };
    const animator = tween(timeObj);
    const effects: CardEffect[] = [];
    this.parent.audioManager.playSoundEffect("worm");

    this._tilesToDestroy.forEach((t, i) => {
      const time = 0.1;
      animator.delay(i == 0 ? 0 : time).call(() => {
        const effect =
          this._cache?.getObjectByPrefabName<CardEffect>("wormEffect");
        if (effect == null) {
          return;
        }

        effect.node.position = t.node.position;
        effect.node.parent = this.parent.effectsNode;
        effect.play();

        effects.push(effect);
      });
    });

    animator
      .delay(0.8)
      .call(() => effects.forEach((e) => e.stopEmmit()))
      .delay(3)
      .call(() => effects.forEach((e) => e.cacheDestroy()));

    animator.start();
    return true;
  }
}
