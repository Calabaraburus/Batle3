//  FieldController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

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
  assert,
  random,
  tween,
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
import { FieldLogicalController } from "./FieldLogicalController";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { Queue } from "../../scripts/Queue";
import { IN_DEBUG } from "../../globals/globals";
const { ccclass, property } = _decorator;

@ccclass("FieldController")
export class FieldController extends Service {
  /**
   * Logic field (e.g. tiles matrix)
   */
  private _bckgField: BackgroundTileController[][] = [];
  private _tilesToDestroy: TileController[] = [];
  private _bonus: BonusModel;
  private _tileCreator: TileCreator | null;
  private _dataService: DataService | null;
  private _logicFieldController: ITileFieldController;
  private _audioManager: AudioManagerService

  public readonly tileClickedEvent: EventTarget = new EventTarget();
  public readonly tileActivatedEvent: EventTarget = new EventTarget();

  public readonly tilesMoveAnimationExecutes: EventTarget = new EventTarget();

  /** Field model */
  // @property({ type: [FieldModel], visible: true, tooltip: "Field model" })
  _fieldModel: FieldModel;

  get fieldModel() {
    return this._fieldModel;
  }

  //set fieldModel(value) {
  //  this._fieldModel = value;
  //}

  @property(UITransform)
  tilesArea: UITransform;

  public get tileCreator(): TileCreator | null {
    return this._tileCreator;
  }

  public set tileCreator(value: TileCreator | null) {
    this._tileCreator = value;
  }

  get fieldMatrix(): ReadonlyMatrix2D<TileController> {
    return this._logicFieldController.fieldMatrix;
  }

  get logicField(): ITileFieldController {
    return this._logicFieldController;
  }

  get bonus(): BonusModel {
    return this._bonus;
  }

  get tiles(): Array<TileController> {
    return [];
  }

  start() {
    this._dataService = this.getServiceOrThrow(DataService);
    this._tileCreator = this.getServiceOrThrow(TileCreator);
    this._fieldModel = this.getServiceOrThrow(FieldModel);
    this._audioManager = this.getServiceOrThrow(AudioManagerService);

    this._logicFieldController = new FieldLogicalController(
      this._fieldModel,
      this.tilesArea,
      this._dataService,
      this._tileCreator
    );

    this.logicField.onTileCreating = this.onTileCreating.bind(this);
  }

  private onTileCreating(tile: TileController) {
    tile.clickedEvent.off("TileController");
    tile.tileActivateEvent.off("TileController");
    tile.clickedEvent.on("TileController", this.tileClicked, this);
    tile.tileActivateEvent.on("TileController", this.tileActivated, this);
  }

  /**
   * Generate tile field
   */
  public generateTiles() {
    console.log(
      "[FieldController] Rows: " +
      this._fieldModel.rows +
      " Cols: " +
      this._fieldModel.cols
    );

    this._logicFieldController.generateTiles();
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
    const tile = this._logicFieldController.createTile({
      row,
      col,
      tileModel,
      playerModel,
      position,
      putOnField,
    });

    return tile;
  }

  /**
   * Method invokes when one of tiles is clicked
   * @param tile tile controller of clicked tile
   */
  private tileClicked(tile: TileController): void {
    if (IN_DEBUG()) console.log("[tile] clicked. Name: " + tile.tileModel.tileName);
    this.tileClickedEvent.emit("FieldController", this, tile);
  }

  private tileActivated(tile: TileController): void {
    this.tileActivatedEvent.emit("FieldController", this, tile);
  }

  public fakeDestroyTile(tile: TileController): void {
    this._logicFieldController.fakeDestroyTile(tile);
  }

  /** Apply current state of field, destroies all fake destroied tiles. */
  public Flush() {
    this._logicFieldController.flush();
  }

  /** Apply just created to false for all new tiles */
  public fixTiles() {
    this._logicFieldController.fixTiles();
  }

  public destroyTile(
    row: number,
    col: number,
    creteria: (tc: TileController) => boolean = () => true,
    destroyServiceTile = false
  ) {
    this._logicFieldController.destroyTile(
      row,
      col,
      creteria,
      destroyServiceTile
    );
  }

  public getStartTile(roteId: number): TileController | null {
    return this._logicFieldController.getStartTile(roteId);
  }

  public getEndTile(roteId: number): TileController | null {
    return this._logicFieldController.getEndTile(roteId);
  }

  public getTile(roteId: number, tileType: TileModel): TileController | null {
    return this._logicFieldController.getTile(roteId, tileType);
  }

  public mixTiles(): void {
    this._logicFieldController.mixTiles();
  }

  public exchangeTiles(t1: TileController, t2: TileController) {
    this._logicFieldController.exchangeTiles(t1, t2);
  }

  public moveTilesLogicaly(backwards = false) {
    this._logicFieldController.moveTilesLogicaly(backwards);
  }

  /** Animate tiles moving to real position */
  public moveTilesAnimate() {


    const soundNames = ["tileSound", "tileSound2", "tileSound3"];
    let ft = true;

    this._logicFieldController.fieldMatrix.forEach((t) => {

      const fromPos = t.node.position;
      const toPos = this._logicFieldController.calculateTilePosition(t.row, t.col);

      if (ft && !fromPos.equals(toPos)) {
        tween(this).delay(t.Speed - 0.1).call(() => {
          this._audioManager.playSoundEffect(soundNames[randomRangeInt(0, soundNames.length)]);
        }).start();

        ft = false;
      }

      t.move(
        fromPos,
        toPos
      );
    });

    this.tilesMoveAnimationExecutes.emit("tilesMoveAnimation", this);
  }

  public analizeTiles() {
    this._logicFieldController.analizeTiles();
  }

  public moveTiles(backwards = false) {
    this._logicFieldController.moveTiles(backwards);
    this.moveTilesAnimate();
  }

  public setBonus(bonus: BonusModel) {
    this._bonus = bonus;
  }
}
