//  TileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  _decorator,
  log,
  EventTarget,
  Button,
  Vec3,
  CCFloat,
  tween,
  v2,
  Sprite,
  __private,
  spriteAssembler,
  assert,
  SpriteFrame,
  randomRangeInt,
} from "cc";
import { NextStepAttackTilesBotAnalizator } from "../../bot/NextStepAttackTilesBotAnalizator";
import { PlayerModel } from "../../models/PlayerModel";
import { TileModel } from "../../models/TileModel";
import { CacheObject } from "../../ObjectsCache/CacheObject";
import { ICacheObject } from "../../ObjectsCache/ICacheObject";
import { FieldController } from "../field/FieldController";
import { CardService } from "../services/CardService";
import { ITileFieldController } from "../field/ITileFieldController";
import { Service } from "../services/Service";
import { DataService } from "../services/DataService";
const { ccclass, property } = _decorator;

@ccclass("TileController")
export class TileController extends CacheObject {
  private _field: ITileFieldController;
  private _button: Button | null;
  private _needMove = false;
  private _from: Vec3;
  private _to: Vec3;
  private _speed: number;
  protected _foregroundSprite: Sprite | null;
  protected _backgroundSprite: Sprite | null;
  private _attackPower: number;
  private _isStarted = false;
  protected dataService: DataService;
  private _isFixed = false;

  public get attackPower() {
    return this._attackPower;
  }
  public set attackPower(value) {
    this._attackPower = value;
  }

  public get isFixed() {
    return this._isFixed;
  }

  public set isFixed(value) {
    this._isFixed = value;
  }

  // private _interactable = true;
  public clickedEvent: EventTarget = new EventTarget();
  public tileActivateEvent: EventTarget = new EventTarget();

  /**Tile model */
  private _tileModel: TileModel;
  get tileModel(): TileModel {
    return this._tileModel;
  }

  get fieldController(): ITileFieldController {
    return this._field;
  }

  /** Speed */
  @property(CCFloat)
  Speed = 1;

  /** Speed */
  @property(CCFloat)
  Acceleration = 0.1;

  public tileAnalized: boolean;

  private _playerModel: PlayerModel | null;
  /** Get player model. */
  public get playerModel(): PlayerModel | null {
    return this._playerModel;
  }
  /** Set player model. */
  public set playerModel(value: PlayerModel | null) {
    this._playerModel = value;
  }

  private _isDestroied = false;
  get isDestroied(): boolean {
    return this._isDestroied;
  }

  private _activating = false;
  get activating(): boolean {
    return this._activating;
  }

  get tileTypeId(): number {
    return this._tileModel.tileId;
  }

  private _justCreated = false;
  get justCreated(): boolean {
    return this._justCreated;
  }
  set justCreated(value: boolean) {
    this._justCreated = value;
  }

  private _col = 0;
  get col(): number {
    return this._col;
  }
  set col(value: number) {
    this._col = value;
  }

  private _row = 0;
  get row(): number {
    return this._row;
  }
  set row(value: number) {
    this._row = value;
  }

  turnBegins(): void {
    return;
  }

  turnEnds(): void {
    return;
  }

  turnBeginsAnimation(): void {
    return;
  }

  turnEndsAnimation(): void {
    return;
  }

  start() {
    this._button = this.getComponent(Button);

    const ds = Service.getService(DataService);

    assert(ds != null, "DataService is null");

    this.dataService = ds;

    this._attackPower = 1;

    this._isStarted = true;

    this.updateSprite();
  }

  private getSpriteInChild(name: string): Sprite | null {
    const node = this.node.getChildByName(name);
    const sprite = node?.getComponent(Sprite);

    if (sprite != null || sprite != undefined) {
      return sprite;
    } else {
      return null;
    }
  }

  public setModel(tileModel: TileModel) {
    if (tileModel == null) {
      log("[tile][error] tile model can't be null");
      return;
    }

    this._tileModel = tileModel;

    if (
      tileModel.tileName == "start" ||
      tileModel.tileName == "end" ||
      tileModel.tileName == "empty"
    ) {
      this._button = this.getComponent(Button);
      if (this._button != null && this._button != undefined) {
        this._button.interactable = false;
      }
    }

    this.updateSprite();
  }

  updateSprite() {
    if (!this._isStarted) return;

    if (this._backgroundSprite == null)
      this._backgroundSprite = this.getSpriteInChild("Background");

    if (this._foregroundSprite == null)
      this._foregroundSprite = this.getSpriteInChild("Foreground");

    if (this._backgroundSprite != null && this.playerModel != null) {
      let bckgName = "oponentBackground";

      if (this.playerModel == this.dataService.playerModel) {
        bckgName = "playerBackground";
      }

      const tm = this.fieldController.fieldModel.getTileModel(bckgName);

      this._backgroundSprite.spriteFrame = this.getRndSpriteFromModel(tm);
    }

    if (this._foregroundSprite != null) {
      this._foregroundSprite.spriteFrame = this.tileModel.sprite;
    }
  }

  setBackground(bkgModelName: string) {
    if (this._backgroundSprite == null)
      this._backgroundSprite = this.getSpriteInChild("Background");

    if (this._backgroundSprite != null && this.playerModel != null) {

      const tm = this.fieldController.fieldModel.getTileModel(bkgModelName);

      this._backgroundSprite.spriteFrame = this.getRndSpriteFromModel(tm);
    }
  }

  private getRndSpriteFromModel(tm: TileModel) {
    const arr: SpriteFrame[] = [];

    arr.push(tm.sprite);

    tm.additionalSprites.forEach(s => arr.push(s.sprite));

    return arr[randomRangeInt(0, arr.length)];
  }

  public setField(field: ITileFieldController) {
    this._field = field;
  }

  /**
   * Method called when Tile pressed
   * @returns void
   */
  public clicked() {
    this.activate();
    this.OnClicked();
  }

  public markAsDestroied() {
    this._isDestroied = true;
  }

  public fakeDestroy() {
    this._isDestroied = true;
    this._field.markTileForDestraction(this);
    // this.node.active = false;
  }

  //public destroyTile() {
  //  this.fakeDestroy();
  //  this.cacheDestroy();
  // }

  public cacheDestroy(): void {
    this._isDestroied = true;
    super.cacheDestroy();
  }

  public cacheCreate(): void {
    this._isDestroied = false;
    this._justCreated = true;

    if (this._button != null) {
      this._button.interactable = true;
    }

    this.isDestroied;
    super.cacheCreate();
  }

  public activate() {
    if (
      this.activating ||
      this._justCreated ||
      !this._button?.interactable ||
      this.isDestroied
    ) {
      return;
    }

    this._activating = true;
    this.OnActivate();
    this._activating = false;
  }

  private OnClicked() {
    this.clickedEvent.emit("TileController", this);
  }

  public OnActivate() {
    this.tileActivateEvent.emit("TileController", this);
  }

  move(from: Vec3, to: Vec3) {
    this._from = from;
    this._to = to;
    this._speed = 0;
    if (!this._to.equals(this._from)) {
      this._needMove = true;
      this.node.position = this._from;
      tween(this.node)
        .to(this.Speed, { position: to }, { easing: "sineIn" })
        .call(() => {
          this._needMove = false;
          if (this._button != null) this._button.interactable = true;
        })
        .start();

      if (this._button != null) this._button.interactable = false;
    }
  }
}