import { _decorator, assert } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { ReadonlyMatrix2D } from "../field/ReadonlyMatrix2D";
import { TileController } from "../tiles/TileController";
import { StdTileController } from "../tiles/UsualTile/StdTileController";
import { DataService } from "./DataService";
import { Service } from "./Service";
import { FieldControllerExtensions } from "../field/FieldExtensions";
const { ccclass } = _decorator;

@ccclass("TileService")
export class TileService extends Service {
  _dataService: DataService;
  _fieldExtensions: FieldControllerExtensions;
  // matrix: ReadonlyMatrix2D<TileController> | undefined;

  start() {
    this._dataService = this.getServiceOrThrow(DataService);

    assert(this._dataService.field != null, "Field can't be null");

    this._fieldExtensions = new FieldControllerExtensions(this._dataService.field);
  }

  public prepareForNewTurn() {
    this._dataService?.field?.fieldMatrix.forEach((t) =>
      this.prepareTileForNewTurn(t)
    );
  }

  private prepareTileForNewTurn(tile: TileController) {
    return true;
  }

  public getTilesByTagInColumn(colId: number, tag: string) {
    return this._fieldExtensions.getTilesByTagInColumn(colId, tag);
  }

  public getTilesInColumn(
    colId: number,
    filtFunc: (val: TileController) => boolean
  ) {
    return this._fieldExtensions.getTilesInColumn(colId, filtFunc)
  }

  public getTilesInRow(
    targetTile: TileController,
    rowId: number,
    power: number,
    filtFunc: (val: TileController) => boolean
  ) {
    return this._fieldExtensions.getTilesInRow(targetTile, rowId, power, filtFunc);
  }

  public getIdenticalTiles(
    targetTile: TileController,
    distanceMatrix: number[][],
    filtFunc: (val: TileController) => boolean
  ) {
    return this._fieldExtensions.getIdenticalTiles(targetTile, distanceMatrix, filtFunc);
  }

  public getDifferentTiles(
    targetTile: TileController,
    distanceMatrix: number[][],
    filtFunc: (val: TileController) => boolean
  ) {
    return this._fieldExtensions.getDifferentTiles(targetTile, distanceMatrix, filtFunc);
  }

  public getMatrixOfTiles(
    currentTile: TileController,
    targetCol: number,
    filtFunc: (val: TileController) => boolean
  ) {
    return this._fieldExtensions.getMatrixOfTiles(currentTile, targetCol, filtFunc);
  }

  public getTilesByTag(tag: string): TileController[] {
    return this._fieldExtensions.getTilesByTag(tag);
  }

  public getTiles(
    filtFunc: (val: TileController) => boolean
  ): TileController[] {
    return this._fieldExtensions.getTiles(filtFunc);
  }

  public getPlayerTiles(): TileController[] {
    return this._fieldExtensions.getPlayerTiles(this._dataService.playerModel);
  }

  public getEnemyTiles(): TileController[] {
    return this._fieldExtensions.getPlayerTiles(this._dataService.botModel);
  }

  public countShielded(tiles: Set<TileController>, shielded = true): number {
    return this._fieldExtensions.countShielded(tiles, shielded);
  }

  public countSame(tiles: Set<TileController>): number {
    return this._fieldExtensions.countSame(tiles);
  }
}


