// Project: Batle2
//
// Author: Natalchishin Taras
//
// Calabaraburus (c) 2023

import {
  _decorator,
  Component,
  UITransform,
  Vec3,
  randomRangeInt,
  EventTarget,
  Vec2,
  CCString,
  CCBoolean,
  Rect,
  PlaceMethod,
  log,
} from "cc";
import { TileController } from "../tiles/TileController";
import { TileModel } from "../../models/TileModel";
import { FieldModel } from "../../models/FieldModel";
import { TileCreator } from "./TileCreator";
import { CreateTileArgs } from "./CreateTileArgs";
import { FieldAnalyzer } from "./FieldAnalizer";
import { AnalizedData } from "./AnalizedData";
import { BonusModel } from "../../models/BonusModel";
import { Matrix2D } from "./Matrix2D";
import { ITileFieldController as ITileFieldController } from "./ITileFieldController";
import { ReadonlyMatrix2D } from "./ReadonlyMatrix2D";
import { BackgroundTileController } from "../tiles/BackgroundTile/BackgroundTileController";
import { Service } from "../services/Service";
import { DataService } from "../services/DataService";
import { ICloneable } from "../../scripts/ICloneable";
import { IDataService } from "../services/IDataService";
import { IVirtualisable } from "../../scripts/IVirtualisable";
import { StdTileController } from "../tiles/UsualTile/StdTileController";
import { DEBUG } from "cc/env";
import { IN_DEBUG } from "../../globals/globals";
const { ccclass, property } = _decorator;

export class FieldLogicalController
  implements ITileFieldController, ICloneable, IVirtualisable {

  /**
   * Logic field (e.g. tiles matrix)
   */
  private _field: Matrix2D<TileController>;

  private _fieldAnalizer: FieldAnalyzer;
  private _tilesToDestroy: TileController[] = [];
  private _tileCreator: TileCreator;
  private _dataService: IDataService;
  private _fieldModel: FieldModel;
  private _tilesArea: UITransform | null;
  private _onTileCreating: ((tile: TileController) => void) = (t) => { };
  private _isVirtual: boolean = false;


  get fieldModel(): FieldModel {
    return this._fieldModel;
  }

  public constructor(
    fieldModel: FieldModel,
    tilesArea: UITransform | null,
    dataService: IDataService,
    tileCreator: TileCreator
  ) {
    this._fieldModel = fieldModel;
    this._dataService = dataService;
    this._tileCreator = tileCreator;
    this._tilesArea = tilesArea;

    this.start();
  }

  public get dataService(): IDataService {
    return this._dataService;
  }

  public get tileCreator(): TileCreator | null {
    return this._tileCreator;
  }

  get fieldMatrix(): ReadonlyMatrix2D<TileController> {
    return this._field.toReadonly();
  }

  get tiles(): Array<TileController> {
    return [];
  }

  public get onTileCreating(): ((tile: TileController) => void) {
    return this._onTileCreating;
  }
  public set onTileCreating(callback: (tile: TileController) => void) {
    this._onTileCreating = callback;
  }

  start() {
    this._field = new Matrix2D(this._fieldModel.rows, this._fieldModel.cols);
    this._fieldAnalizer = new FieldAnalyzer(this);
  }

  /**
   * Generate tile field
   */
  public generateTiles() {
    console.log(
      "[field] Rows: " +
      this._fieldModel.rows +
      " Cols: " +
      this._fieldModel.cols
    );

    if (this._tileCreator == null) {
      throw Error("Tile creator is null.");
    }

    const map = this._fieldModel.getFieldMap();

    for (let yIndex = 0; yIndex < this._fieldModel.rows; yIndex++) {
      for (let xIndex = 0; xIndex < this._fieldModel.cols; xIndex++) {
        const mapMnem = map[yIndex][xIndex];

        const tileModel = this._fieldModel.getTileModelByMapMnemonic(this.clearMnem(mapMnem));

        const playerModel =
          mapMnem.endsWith("?")
            ? this._dataService.playerModel
            : mapMnem.endsWith("^")
              ? this._dataService.botModel
              : null;

        if (tileModel != null) {
          this.createTile({
            row: yIndex,
            col: xIndex,
            tileModel,
            playerModel: playerModel,
            putOnField: true,
          });
        }
      }
    }
  }

  clearMnem(mnem: string) {
    return mnem.length > 1 ? mnem.replace("?", "").replace("^", "") : mnem;
  }

  /**
   * Creates tile instance
   * @param row row position on logic field
   * @param col col position on logic field
   * @param tileModel tile model
   * @param playerModel player model
   * @param position real position on scene
   * @param putOnField determines the need of putting tile on logic field
   * (game puts tile only to the scene)
   * @returns returns tile controller
   */
  public createTile({
    row,
    col,
    tileModel,
    playerModel,
    position = null,
    putOnField = false,
  }: CreateTileArgs): TileController | null {
    if (this._tileCreator == null) {
      throw Error("Tile creator is null.");
    }

    if (tileModel == null) {
      throw Error("Tile model argument is null");
    }

    const tile = this._tileCreator.create(tileModel.tileName);

    if (tile == null) return null;

    const tileController = tile.getComponent(TileController);

    if (tileController != null) {

      tileController.justCreated = true;
      tileController.playerModel = playerModel;
      tileController.node.parent = this._tilesArea == null ? null : this._tilesArea.node;
      tileController.row = row;
      tileController.col = col;

      this._onTileCreating(tileController);

      tileController.setField(this);
      tileController.setModel(tileModel);

      this.virtualizeTile(tileController, this._isVirtual);

      if (!this._isVirtual) {
        tile.active = true;
      }

      if (putOnField) {
        this._field.set(row, col, tileController);
      }
    }

    const uiTransform = tileController?.getComponent(UITransform);

    const tPos = this.calculateTilePosition(row, col);

    tile.position = position == null ? tPos : position;
    const size = this.calculateTileSize(uiTransform);

    tile.scale = size;

    return tileController;
  }

  public calculateTilePosition(row: number, col: number): Vec3 {

    if (this._tilesArea == null) return new Vec3();

    const border = this._fieldModel.border / 2;
    const tW = this._tilesArea.width / this._fieldModel.cols;
    const tilesHeight = tW * this._fieldModel.rows;
    return new Vec3(
      col * tW +
      border -
      this._tilesArea.anchorX * this._tilesArea.width +
      tW / 2,
      row * tW + border - this._tilesArea.anchorY * tilesHeight + tW / 2
    );
  }

  public calculateTileSize(
    tileTransform: UITransform | null | undefined
  ): Vec3 {
    if (this._tilesArea == null) return new Vec3();

    const tW = this._tilesArea.width / this._fieldModel.cols;
    const tileTransformwidth = tileTransform != null ? tileTransform.width : 0;
    const coef = tW / (tileTransformwidth + this._fieldModel.border);

    return new Vec3(coef, coef, 1);
  }

  private moveAllTilesOnARote(roteId: number, backwards = false) {
    const startTile = this.getStartTile(roteId);
    const endTile = this.getEndTile(roteId);
    const emptyModel = this._fieldModel.getTileModel("empty");

    if (startTile == null || endTile == null) {
      return;
    }



    if (IN_DEBUG()) {
      this._field.forEach((item, i, j) => {

        if (item != null && this._field.get(i, j) != this._field.get(item.row, item.col)) {
          log();
        }
      });
    }


    const findTiles = (destroied: boolean): TileController[] => {
      const res: TileController[] = [];

      this._field.forEach((tile, rowId, colId) => {
        if (roteId == colId) {
          if (
            tile.isDestroied == destroied &&
            tile != startTile &&
            tile != endTile &&
            tile.tileTypeId != emptyModel.tileId
          ) {
            res.push(tile);
          }
        }
      });

      return res;
    };

    let fwd = endTile.row > startTile.row;
    fwd = backwards ? !fwd : fwd;

    const tStartTile = backwards ? endTile : startTile;
    const tEndTile = backwards ? startTile : endTile;

    const destroiedTiles = findTiles(true).map((t) => new Vec2(t.col, t.row));

    if (destroiedTiles.length == 0) {
      return;
    }



    if (IN_DEBUG()) {
      this._field.forEach((item, i, j) => {

        if (item != null && this._field.get(i, j) != this._field.get(item.row, item.col)) {
          log();
        }
      });
    }


    const pathTiles: TileController[] | null[] = [];

    const tileMapSimbol = fwd ? "?" : "^";

    // finds all live tiles and put them to path
    const liveTiles = findTiles(false);
    liveTiles.forEach((t, i) => {
      pathTiles[destroiedTiles.length + (fwd ? i : liveTiles.length - i - 1)] =
        t;
    });

    // add new tiles
    for (let index = 0; index < destroiedTiles.length; index++) {
      const tileRowId = fwd
        ? tStartTile.row + 1 + index
        : tStartTile.row - 1 - index;
      const yPosIndex = fwd
        ? tStartTile.row - 1 - index
        : tStartTile.row + 1 + index;

      const tile = this.createTile({
        row: tileRowId,
        col: roteId,
        tileModel: this._fieldModel.getTileModelByMapMnemonic(tileMapSimbol),
        playerModel:
          tileMapSimbol == "?"
            ? this.dataService.playerModel
            : tileMapSimbol == "^"
              ? this.dataService.botModel
              : null,
      });

      if (tile != null) {
        tile.node.position = this.calculateTilePosition(
          yPosIndex,
          startTile.col
        );
      }

      pathTiles[fwd ? index : destroiedTiles.length - index - 1] = tile;
    }

    if (IN_DEBUG()) {
      this._field.forEach((item, i, j) => {

        if (item != null && this._field.get(i, j) != this._field.get(item.row, item.col)) {
          log();
        }
      });
    }

    let tileRowId = fwd ? tStartTile.row : tStartTile.row;

    pathTiles.forEach((t: TileController | null, i) => {
      if (t == null) {
        throw Error("Tile in path is null. It can't be null");
      }

      if (t.isFixed) return;

      let origTile: TileController;

      do {
        tileRowId = fwd ? (tileRowId + 1) : (tileRowId - 1);
        origTile = this._field.get(tileRowId, t.col);
      } while (!origTile.isDestroied && origTile.isFixed);

      t.row = tileRowId;
      this._field.set(t.row, t.col, t);
    });

    if (IN_DEBUG()) {
      this._field.forEach((item, i, j) => {

        if (item == null || this._field.get(i, j) != this._field.get(item.row, item.col)) {
          log();
        }
      });
    }
  }

  // getCurOrNextNotFixed(fwd: boolean, row: number, col: number, endRow: number) {
  //   for (let index = endRow; fwd ? index >= row : index < row; fwd ? index-- : index++) {
  //     const tile = this._field.get(index, col);
  //     if (tile.isDestroied) {
  //       return tile;
  //     }
  //   }
  // }

  public fakeDestroyTile(tile: TileController): void {
    tile.fakeDestroy();
    this.markTileForDestraction(tile);
  }

  public markTileForDestraction(tile: TileController): void {
    this._tilesToDestroy.push(tile);
  }

  /** Apply current state of field, destroies all fake destroied tiles. */
  public flush(): void {
    this.finalyDestroyTiles();
  }

  /** Apply just created to false for all new tiles */
  public fixTiles() {
    this._analizedData?.justCreatedTiles.forEach((tile) => {
      tile.justCreated = false;
    });
  }

  public destroyTile(
    row: number,
    col: number,
    creteria: (tc: TileController) => boolean = () => true,
    destroyServiceTile = false
  ) {
    var result = null;
    if (
      row >= 0 &&
      row < this.fieldMatrix.rows &&
      col >= 0 &&
      col < this.fieldMatrix.cols
    ) {
      const tile = this.fieldMatrix.get(row, col);
      if (creteria(tile)) {
        if (
          (tile.tileModel.serviceTile && destroyServiceTile) ||
          !tile.tileModel.serviceTile
        ) {
          tile.fakeDestroy();
          result = tile;
        }
      }
    }

    return result;
  }

  private finalyDestroyTiles() {
    this._tilesToDestroy.forEach((tile) => tile.cacheDestroy());
    this._tilesToDestroy.length = 0;
  }

  private moveTile(tile: TileController, position: Vec3) {
    tile.move(tile.node.position, position);
  }

  public getStartTile(roteId: number): TileController | null {
    const startModel = this._fieldModel.getTileModel("start");
    return this.getTile(roteId, startModel);
  }

  public getEndTile(roteId: number): TileController | null {
    const startModel = this._fieldModel.getTileModel("end");
    return this.getTile(roteId, startModel);
  }

  public getTile(roteId: number, tileType: TileModel): TileController | null {
    let res = null;

    this._field.forEach((tile, i, j) => {
      if (tile != null) {
        if (j == roteId) {
          if (tile.tileTypeId == tileType.tileId) {
            res = tile;
            return;
          }
        }
      }
    });

    return res;
  }

  public mixTiles(): void {
    const rndTiles: TileController[] = [];

    this._field.forEach((tile) => {
      if (
        !(
          tile.tileModel.tileName == "start" ||
          tile.tileModel.tileName == "empty" ||
          tile.tileModel.tileName == "end"
        )
      ) {
        rndTiles.push(tile);
      }
    });

    const tindxs = Array.from(Array<number>(rndTiles.length).keys());

    while (tindxs.length > 0) {
      const id: number = randomRangeInt(0, tindxs.length);
      const tndid = tindxs[id];
      tindxs.splice(id, 1);
      const id2: number = randomRangeInt(0, tindxs.length);
      const tndid2 = tindxs[id2];
      tindxs.splice(id2, 1);
      this.exchangeTiles(rndTiles[tndid], rndTiles[tndid2]);
    }

    this._field.forEach((tile) => {
      tile.node.parent = null;

      this.moveTile(tile, this.calculateTilePosition(tile.row, tile.col));
    });
  }

  public exchangeTiles(t1: TileController, t2: TileController) {
    this._field.set(t1.row, t1.col, t2);
    this._field.set(t2.row, t2.col, t1);

    let tval = t1.row;
    t1.row = t2.row;
    t2.row = tval;

    tval = t1.col;
    t1.col = t2.col;
    t2.col = tval;
  }

  public reset() {

    this.flush();

    this._field.forEach((tile) => {
      tile.cacheDestroy();
      // this._tilesToDestroy.push(tile);
    });

    this._field.clear();

    // this.generateTiles();
    // this.EndTurn(true);
  }

  public moveTilesLogicaly(backwards = false) {
    for (let index = 0; index < this._fieldModel.cols; index++) {
      this.moveAllTilesOnARote(index, backwards);
    }
  }

  private _analizedData: AnalizedData | null;

  public analizeTiles() {
    this._analizedData = this._fieldAnalizer?.analyze();
  }

  public moveTiles(backwards = false) {
    this.analizeTiles();

    if (this._analizedData != null) {
      this.moveTilesLogicaly(backwards);
      this.fixTiles();
      this.flush();
    }
  }

  virtualize(virtualize = true): void {

    this._isVirtual = true;

    this._field.forEach((t, i, j) => {
      if (IN_DEBUG()) {
        if (t == null) {
          log();
        }
      }
      this.virtualizeTile(t, virtualize);
    });
  }

  virtualizeTile(tile: TileController, virtualize = true) {
    if (virtualize) {
      tile.node.parent = null;
    } else {
      tile.node.parent = this._tilesArea == null ? null : this._tilesArea.node;

    }

    tile.virtual = virtualize;
  }

  clone(): FieldLogicalController {
    const clone = new FieldLogicalController(
      this.fieldModel,
      null,
      this._dataService,
      this._tileCreator
    );

    clone._field = this._field.clone();
    clone._isVirtual = this._isVirtual;
    clone._tilesArea = this._isVirtual ? null : this._tilesArea;

    this._field.forEach((item, i, j) => {
      const cTile = clone.createTile({
        row: item.row,
        col: item.col,
        tileModel: item.tileModel,
        playerModel: item.playerModel,
        putOnField: true,
      });

      if (IN_DEBUG()) {
        if (cTile == null || clone._field.get(i, j) == null) {
          log();
        }

        if (this._field.get(i, j) != this._field.get(item.row, item.col)) {
          log();
        }

        if (clone._field.get(i, j) != clone._field.get(item.row, item.col)) {
          log();
        }
      }

      if (cTile instanceof StdTileController) {
        if (item instanceof StdTileController) {
          cTile.activateShield(item.shieldIsActivated);

        }
      }

      //if (cTile != null) {

      // this.virtualizeTile(cTile, this._isVirtual);

      // clone._field.set(item.row, item.col, cTile);
      //}
    });
    if (IN_DEBUG()) {
      clone._field.forEach((item, i, j) => {

        if (item == null || clone._field.get(i, j) != clone._field.get(item.row, item.col)) {
          log();
        }
      });

      this._field.forEach((item, i, j) => {

        if (item == null || this._field.get(i, j) != this._field.get(item.row, item.col)) {
          log();
        }
      });
    }
    return clone;
  }
}
