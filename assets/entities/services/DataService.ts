import { _decorator } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { EnemyFieldController } from "../enemyField/EnemyFieldController";
import { FieldAnalyzer } from "../field/FieldAnalizer";
import { FieldController } from "../field/FieldController";
import { GameManager } from "../game/GameManager";
import { LevelController } from "../level/LevelController";
import { PlayerFieldController } from "../playerField/PlayerFieldController";
import { DebugView } from "../ui/debugger/DebugView";
const { ccclass } = _decorator;
import { Service } from "./Service";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { IDataService } from "./IDataService";
import { ITileFieldController } from "../field/ITileFieldController";
import { FieldControllerExtensions } from "../field/FieldExtensions";

@ccclass("DataService")
export class DataService extends Service implements IDataService {
  protected _debug: DebugView;
  protected _levelController: LevelController;
  protected _analizer: FieldAnalyzer;
  protected _botModel: PlayerModel;
  protected _playerModel: PlayerModel;
  protected _field: ITileFieldController;
  protected _enemyFieldController: EnemyFieldController;
  protected _playerFieldController: PlayerFieldController;
  protected _levelConfig: LevelConfiguration;
  protected _fieldExt: FieldControllerExtensions;
  private _fieldController: FieldController;

  public get debugView() {
    return this._debug;
  }

  public get levelController() {
    return this._levelController;
  }

  public get fieldAnalizer() {
    return this._analizer;
  }

  public get botModel() {
    return this._botModel;
  }

  public get playerModel() {
    return this._playerModel;
  }

  public get playerFieldController() {
    return this._playerFieldController;
  }

  public get enemyFieldController() {
    return this._enemyFieldController;
  }

  get field() {
    return this._field;
  }

  get fieldController() {
    return this._fieldController;
  }

  get fieldExt() {
    return this._fieldExt;
  }

  public get levelConfiguration() {
    return this._levelConfig;
  }

  start() {
    this._debug = this.getServiceOrThrow(DebugView);
    this._fieldController = this.getServiceOrThrow(FieldController);
    this._field = this._fieldController.logicField;
    this._levelConfig = this.getServiceOrThrow(LevelConfiguration);

    this._analizer = new FieldAnalyzer(this._field);

    this._levelController = this.getServiceOrThrow(LevelController);
    this._botModel = this.levelConfiguration.botModel;
    this._playerModel = this.levelConfiguration.playerModel;

    this._playerFieldController = this.getServiceOrThrow(PlayerFieldController);
    this._enemyFieldController = this.getServiceOrThrow(EnemyFieldController);

    this._fieldExt = new FieldControllerExtensions(this._field);
  }
}
