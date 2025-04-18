//  StdTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  _decorator,
  Sprite,
  SpriteFrame,
  Vec3,
  instantiate,
  Prefab,
  UITransform,
  Node,
  randomRangeInt,
  tween,
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { CardService } from "../../services/CardService";
import { Service } from "../../services/Service";
import { DataService } from "../../services/DataService";
import { CardEffect } from "../../effects/CardEffect";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { EffectsService } from "../../services/EffectsService";
import { FieldController } from "../../field/FieldController";
import { GameManager } from "../../game/GameManager";
import { TaskInfo } from "../../ui/taskInfo/TaskInfo";
import { MonkTileController } from "../MonkTile/MonkTileController";
import { ITileFieldController } from "../../field/ITileFieldController";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
const { ccclass, property } = _decorator;

@ccclass("MonkSummonerTileController")
export class MonkSummonerTileController extends TileController {

  private _curPeriod: number;

  SummonPeriod: number = 3;

  private readonly monkModelName = "monk";
  private _dataService: DataService;
  private _effectsService: EffectsService;
  private _fieldController: FieldController;
  private _gameManager: GameManager;
  private _taskInfo: TaskInfo;
  private _isInitUpdated = false;

  private maxMonks = 10;
  private maxMonksDeaths = 5;

  private _curMonksCount: number;
  private _curMonksDthCount: number;
  private _curMonksSurvCount: number;
  private _audioSrvc: AudioManagerService;

  start(): void {
    this._curMonksCount = this.maxMonks - 1; // -1 b'cose first monk is on field at start of a round
    this._curMonksDthCount = this.maxMonksDeaths;
    this._curMonksSurvCount = 0;

    this._curPeriod = this.SummonPeriod;
    this._fieldController = Service.getServiceOrThrow(FieldController);
    this._dataService = Service.getServiceOrThrow(DataService);
    this._effectsService = Service.getServiceOrThrow(EffectsService);
    this._gameManager = Service.getServiceOrThrow(GameManager)
    this._audioSrvc = Service.getServiceOrThrow(AudioManagerService);
    this._taskInfo = Service.getServiceOrThrow(TaskInfo);
    this.updateTaskInfo();
  }

  turnEnds(): void {

    if (!this._isInitUpdated) {
      this.updateSummonerOnField(this._dataService.field);
      this._isInitUpdated = true;
    }

    this._curPeriod--;

    if (this._curPeriod < 0) {
      this._curPeriod = this.SummonPeriod;
      this.summon();
    }
  }

  updateTaskInfo() {
    this._taskInfo.setAllCount(this._curMonksCount);
    this._taskInfo.setDthCount(this._curMonksDthCount);
  }

  summon() {

    if (this._curMonksCount <= 0) return;

    this._curMonksCount--;
    this.updateTaskInfo();

    const model = this._fieldController.fieldModel.getTileModel(this.monkModelName);

    if (model == null) { throw Error("Can't find model"); }

    let col = 0;

    [0, 0, 0, 0].forEach(() => col = randomRangeInt(0, this._fieldController.fieldMatrix.cols));

    const targetTile = this._fieldController.fieldMatrix.get(this.row + 1, col);

    targetTile.fakeDestroy();

    const tile = this._fieldController.createTile({
      row: targetTile.row,
      col: targetTile.col,
      tileModel: model,
      playerModel: this._dataService.playerModel,
      position: targetTile.node.position,
      putOnField: true,
    });

    if (tile instanceof MonkTileController) {
      tile.setSummoner(this);
    }

    if (tile) {
      this.effect(tile);
    }

    this._fieldController.moveTilesLogicaly(this._gameManager.playerTurn);
    this._fieldController.fixTiles();
  }

  public updateSummonerOnField(field: ITileFieldController) {
    field.fieldMatrix.forEach(tile => {
      if (tile instanceof MonkTileController) {
        tile.setSummoner(this);
      }
    })
  }

  public informAboutMonkDeath() {
    this._curMonksDthCount--;

    if (this._curMonksDthCount <= 0) {
      this._dataService.playerModel.life = 0;
    }

    if ((this._curMonksSurvCount + (this.maxMonksDeaths - this._curMonksDthCount)) >= this.maxMonks) {
      this._dataService.botModel.life = 0;
    }

    this.updateTaskInfo();
  }

  public informAboutMonkSurvive() {
    this._curMonksSurvCount++;

    if ((this._curMonksSurvCount + (this.maxMonksDeaths - this._curMonksDthCount)) >= this.maxMonks) {
      this._dataService.botModel.life = 0;
    }

    this.updateTaskInfo();
  }

  effect(tile: TileController) {
    const effects: CardEffect[] = [];


    const effect =
      ObjectsCache.instance?.getObjectByPrefabName<CardEffect>("explosion2Effect");

    if (effect == null) {
      return;
    }

    effect.node.position = tile.node.position;
    effect.node.parent = this._effectsService.effectsNode;
    effect.play();

    this._audioSrvc.playSoundEffect("monk");

    const animator = tween(this);
    animator.delay(1).call(() => effect.cacheDestroy());

    animator.start();
  }
}
