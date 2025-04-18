import { Vec3, assert, randomRange, randomRangeInt } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { AnimationEffect } from "../../effects/AnimationEffect";
import { IAttackable, isIAttackable } from "../IAttackable";

/**
 * Counterattack behaviour
 * 
 */
export class CounterattackCardSubehaviour extends CardsSubBehaviour {
  private _tilesToDestroy: TileController[];
  private _direction: number;
  private _minSelect = 3;
  private _maxSelect = 3;
  private _rowsToCAtk = 3;
  private _selectedCols: { c: number, rstrt: number, rstp: number }[];
  private _excludeTiles: [string, string] = ["mine", "mineLow"];

  prepare(): boolean {

    let targetRow = this.parent.startTilesP2[0].row - 1; // should be 10 in default wariation of game
    let eRow = this.parent.startTilesP1[0].row + 1;
    this._direction = 1;
    if (!this.parent.gameState.isPlayerTurn) {
      targetRow = this.parent.startTilesP1[0].row + 1; // should be 1 in default wariation of game
      eRow = this.parent.startTilesP2[0].row - 1;
      this._direction = -1;
    }

    const matrix = this.parent.field.fieldMatrix;

    this.effectDurationValue = 0.8;

    this._tilesToDestroy = [];

    const colToSelect = randomRangeInt(this._minSelect, this._maxSelect > matrix.rows ? matrix.rows : this._maxSelect);

    const columnsIdToSelect = Array<number>(10).fill(0).map((_, i) => i);
    this._selectedCols = [];

    for (let index = 0; index < colToSelect; index++) {
      const id = randomRangeInt(0, columnsIdToSelect.length);
      const element = columnsIdToSelect[id];
      columnsIdToSelect.splice(id, 1);
      this._selectedCols.push({ c: element, rstrt: -1, rstp: -1 });
    }

    for (const col of this._selectedCols) {
      let addedRows = 0;
      col.rstrt = eRow;

      for (let row = eRow;
        this._direction > 0 ? row <= targetRow : row >= targetRow;
        row += this._direction) {
        const tile = matrix.get(row, col.c);
        if (tile.playerModel == this.parent.currentOponentModel && !tile.tileModel.serviceTile) {
          if (!this._excludeTiles.includes(tile.tileModel.tileName)) {
            this._tilesToDestroy.push(tile);
            addedRows++;
            if (addedRows >= this._rowsToCAtk) break;
          }
        } else {
          col.rstp = row;
        }
      }
    }

    return true;
  }

  run(): boolean {
    if (!this._tilesToDestroy) return false;
    this._tilesToDestroy.forEach((tile) => {
      console.log(tile.row);
      console.log(tile.col);
      console.log("-----");
      if (isIAttackable(tile)) {
        (<IAttackable>tile).attack(1);
      } else {
        this.parent.field?.fakeDestroyTile(tile);
      }
    });

    return true;
  }

  effect(): boolean {
    this.parent.debug?.log("[c_attack_sub] Start effect.");

    assert(ObjectsCache.instance != null, "Cache is null");

    const cache = ObjectsCache.instance;

    this.parent.audioManager.playSoundEffect("push");

    const matrix = this.parent.field.fieldMatrix;

    this._selectedCols.forEach(col => {
      matrix.forEachCol(col.c, (tile, row) => {
        const effect =
          cache.getObjectByPrefabName<AnimationEffect>("motivateEffect");

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

    });

    this.parent.debug?.log("[c_attack_sub] End effect.");

    return true;
  }
}

