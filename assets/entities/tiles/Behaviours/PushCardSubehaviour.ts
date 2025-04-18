import { Vec3, assert } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { FieldController } from "../../field/FieldController";
import { CardService } from "../../services/CardService";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { AnimationEffect } from "../../effects/AnimationEffect";
import { ReadonlyMatrix2D } from "../../field/ReadonlyMatrix2D";
import { IAttackable, isIAttackable } from "../IAttackable";

export class PushCardSubehaviour extends CardsSubBehaviour {
  private _cache: ObjectsCache;

  private _tilesToDestroy: TileController[] | undefined;
  private _matrix: ReadonlyMatrix2D<TileController>;
  private _direction: number;

  prepare(): boolean {
    const targetTile = this.parent.target as StdTileController;

    let targetRow = this.parent.startTilesP2[0].row - 1; // should be 10 in default variation of game
    this._direction = 1;
    if (!this.parent.gameState.isPlayerTurn) {
      targetRow = this.parent.startTilesP1[0].row + 1; // should be 1 in default variation of game
      this._direction = -1;
    }

    this._matrix = this.parent.field?.fieldMatrix;

    this.effectDurationValue = 0.8;

    this._tilesToDestroy = [];

    this._matrix.forEachInRow(targetRow, (tile, colId) => {
      if (tile.playerModel == this.parent.cardService.getOponentModel() &&
        !tile.tileModel.serviceTile) {
        this._tilesToDestroy?.push(tile);
      }
    });

    assert(ObjectsCache.instance != null, "Cache is null");

    this._cache = ObjectsCache.instance;

    return true;
  }

  run(): boolean {
    if (!this._tilesToDestroy) return false;
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
    this.parent.debug?.log("[push_card_sub] Start effect.");
    const curPlayer = this.parent.cardService.getCurrentPlayerModel();

    this.parent.audioManager.playSoundEffect("push");

    this._matrix.forEach((tile) => {
      if (tile.playerModel != curPlayer) return;

      const effect =
        this._cache?.getObjectByPrefabName<AnimationEffect>("motivateEffect");

      if (effect == null) {
        return false;
      }

      effect.node.parent = null;
      effect.node.parent = tile.node.parent;
      effect.node.position = tile.node.position;
      effect.node.scale = tile.node.scale;
      effect.node.setRotationFromEuler(new Vec3(0, 0, this._direction > 0 ? 0 : 180))
      effect.play();
    });

    this.parent.debug?.log("[push_card_sub] End effect.");

    return true;
  }
}
