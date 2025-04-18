import { math } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { TileController } from "../tiles/TileController";
import { StdTileController } from "../tiles/UsualTile/StdTileController";
import { ITileFieldController } from "./ITileFieldController";
import { TileModel } from "../../models/TileModel";

export class FieldControllerExtensions {
  private _field: ITileFieldController;



  public get field() {
    return this._field;
  }

  constructor(field: ITileFieldController) {
    this.setField(field);
  }

  public setField(field: ITileFieldController) {
    this._field = field;
  }

  public getTilesByTagInColumn(colId: number, tag: string) {
    const tiles: TileController[] = [];
    this._field.fieldMatrix.forEachCol(colId, (t) => {
      if (t.tileModel.containsTag(tag)) {
        tiles.push(t);
      }
    });

    return tiles;
  }

  public getTilesInColumn(
    colId: number,
    filtFunc: (val: TileController) => boolean
  ) {
    const tiles: TileController[] = [];
    this._field.fieldMatrix.forEachCol(colId, (t) => {
      if (filtFunc(t)) {
        tiles.push(t);
      }
    });

    return tiles;
  }

  public getTilesInRow(
    targetTile: TileController,
    rowId: number,
    power: number,
    filtFunc: (val: TileController) => boolean
  ) {
    const tiles: TileController[] = [];
    this._field.fieldMatrix.forEachInRow(rowId, (t, colId) => {
      if (targetTile.col + power >= colId && targetTile.col - power <= colId) {
        if (filtFunc(t)) {
          tiles.push(t);
        }
      }
    });

    return tiles;
  }

  public getIdenticalTiles(
    targetTile: TileController,
    distanceMatrix: number[][],
    filtFunc: (val: TileController) => boolean
  ) {
    let tilesWeight = 0;
    const matrix = this._field.fieldMatrix;
    if (matrix == undefined) return;
    distanceMatrix.forEach((coordinates) => {
      const tile = matrix.get(
        targetTile.row + coordinates[1],
        targetTile.col + coordinates[0]
      );
      if (tile) {
        if (filtFunc(tile)) {
          const w = this.checkCoordinates(
            tile,
            distanceMatrix,
            targetTile,
            filtFunc
          );
          if (w == undefined) return;
          if (w[1] == 3) {
            tilesWeight = tilesWeight + 1;
          }
        }
      }
    });

    return tilesWeight;
  }

  public getDifferentTiles(
    targetTile: TileController,
    distanceMatrix: number[][],
    filtFunc: (val: TileController) => boolean
  ) {
    let tilesWeight = 0;
    const matrix = this._field.fieldMatrix;
    if (matrix == undefined) return;
    distanceMatrix.forEach((coordinates) => {
      const tile = matrix.get(
        targetTile.row + coordinates[1],
        targetTile.col + coordinates[0]
      );
      if (tile) {
        if (filtFunc(tile)) {
          const w = this.checkCoordinates(
            tile,
            distanceMatrix,
            targetTile,
            filtFunc
          );
          if (w == undefined) return;
          if (w[0] == 3) {
            tilesWeight = tilesWeight + 1;
          }
        } else if (!filtFunc(tile)) {
          tilesWeight = tilesWeight + 1;
        }
      } else if (tile == undefined) {
        tilesWeight = tilesWeight + 1;
      }
    });

    return tilesWeight;
  }

  private checkCoordinates(
    tile: TileController,
    coordinates: number[][],
    targetTile: TileController,
    filtFunc: (val: TileController) => boolean
  ) {
    // weight
    const matrix = this._field.fieldMatrix;
    if (matrix == undefined) return;
    //for different
    let wDifferent = 0;
    //for same
    let wSame = 0;
    coordinates.forEach((coord) => {
      const tileCheck = matrix.get(tile.row + coord[1], tile.col + coord[0]);
      if (tileCheck) {
        if (filtFunc(tileCheck)) {
          if (tileCheck.tileModel.tileId != targetTile.tileModel.tileId) {
            if (tile.tileModel.tileName != tileCheck?.tileModel.tileName) {
              wDifferent = wDifferent + 1;
            }
          } else if (tile.tileModel.tileName == tileCheck?.tileModel.tileName) {
            wSame = wSame + 1;
          }
        } else if (!filtFunc(tileCheck)) {
          wDifferent = wDifferent + 1;
        }
      } else if (tileCheck == undefined) {
        wDifferent = wDifferent + 1;
      }
    });
    return [wDifferent, wSame];
  }

  public getMatrixOfTiles(
    currentTile: TileController,
    targetCol: number,
    filtFunc: (val: TileController) => boolean
  ) {
    const tilesMatrix: TileController[] = [];
    const matrix = this._field.fieldMatrix;
    if (matrix == undefined) return;
    matrix.forEachCol(targetCol, (tile, rowId) => {
      if (tile) {
        if (filtFunc(tile)) {
          if (currentTile.row + 1 >= rowId && currentTile.row - 1 <= rowId) {
            tilesMatrix.push(tile);
          }
        }
      }
    });
    return tilesMatrix;
  }

  public getTilesByTag(tag: string): TileController[] {
    const result = this._field.fieldMatrix.filter((t) =>
      t.tileModel.containsTag(tag)
    );

    return result == null ? [] : result;
  }

  public getTiles(
    filtFunc: (val: TileController) => boolean
  ): TileController[] {
    const result = this._field.fieldMatrix.filter(filtFunc);

    return result == null ? [] : result;
  }

  public getFirstTileInColumnByTag(tag: string): TileController | null {
    const tiles = this.getTilesByTag(tag)

    return tiles.length > 0 ? tiles[0] : null;
  }

  public getPlayerTiles(playerModel: PlayerModel): TileController[] {
    return this.getTiles(
      (t) => t.playerModel == playerModel && !t.tileModel.serviceTile
    );
  }

  public countInColumn(col: number, filtFunc: (val: TileController) => boolean): number {
    let result = 0;
    this._field.fieldMatrix.forEachCol(col, (item, row) => { if (filtFunc(item)) result++; });
    return result;
  }

  public countInRow(row: number, filtFunc: (val: TileController) => boolean): number {
    let result = 0;
    this._field.fieldMatrix.forEachInRow(row, (item, col) => { if (filtFunc(item)) result++; });
    return result;
  }

  public countShielded(tiles: Set<TileController>, shielded = true): number {
    let result = 0;
    tiles.forEach((t) => {
      if (t instanceof StdTileController) {
        if (shielded ? !t.shieldIsActivated : t.shieldIsActivated) {
          result++;
        }
      }
    });

    return result;
  }

  public countSame(tiles: Set<TileController>): number {
    let result = 0;
    tiles.forEach((t) => {
      if (t instanceof StdTileController) {
        result++;
      }
    });

    return result;
  }

  public countTilesOfSameGroup(tiles: TileController[], tileModel: TileModel): number {
    let result = 0;
    tiles.forEach((t) => {
      if (t.tileModel == tileModel) {
        result++;
      }
    });

    return result;
  }

  public closest(tile: TileController) {
    const mtx = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    const res = [];

    for (const item of mtx) {
      const r = tile.row + item[0];
      const c = tile.col + item[1];

      if ((r >= 0 && r < this._field.fieldMatrix.rows) &&
        (c >= 0 && c < this._field.fieldMatrix.cols)) {
        res.push(this.field.fieldMatrix.get(r, c));
      }
    }

    return res;
  }

  public getVerticalDistance(tileFrom: TileController, tileTo: TileController): number {
    return Math.abs(tileFrom.row - tileTo.row);
  }

  public getHorizontalDistance(tileFrom: TileController, tileTo: TileController): number {
    return Math.abs(tileFrom.col - tileTo.col);
  }

  public findTilesByModelName(name: string): TileController[] {
    const tileModel = this._field.fieldModel.getTileModel(name);
    return this._field.fieldMatrix.filter((t) => t.tileModel === tileModel);
  }

}

