
import { FieldAnalyzer } from "../entities/field/FieldAnalizer";
import { DataService } from "../entities/services/DataService";
import { GameManager } from "../entities/game/GameManager";
import { LevelController } from "../entities/level/LevelController";
import { PlayerModel } from "../models/PlayerModel";
import { FieldController } from "../entities/field/FieldController";
import { EnemyFieldController } from "../entities/enemyField/EnemyFieldController";
import { PlayerFieldController } from "../entities/playerField/PlayerFieldController";
import { LevelConfiguration } from "../entities/configuration/LevelConfiguration";
import { DebugView } from "../entities/ui/debugger/DebugView";
import { ITileFieldController } from "../entities/field/ITileFieldController";
import { _decorator, __private } from "cc";
import { FieldControllerExtensions } from "../entities/field/FieldExtensions";
import { DebugViewForBot } from "./DebugViewForBot";
const { ccclass } = _decorator;

@ccclass("DataServiceForBot")
export class DataServiceForBot extends DataService {

    public get debugView() {
        return this._debug;
    }
    public set debugView(value: DebugView) {
        this._debug = value;
    }

    public get levelController() {
        return this._levelController;
    }
    public set levelController(value: LevelController) {
        this._levelController = value;
    }

    public get fieldAnalizer() {
        return this._analizer;
    }
    public set fieldAnalizer(value: FieldAnalyzer) {
        this._analizer = value;
    }

    public get botModel() {
        return this._botModel;
    }
    public set botModel(value: PlayerModel) {
        this._botModel = value;
    }

    public get playerModel() {
        return this._playerModel;
    }
    public set playerModel(value: PlayerModel) {
        this._playerModel = value;
    }

    public get playerFieldController() {
        return this._playerFieldController;
    }
    public set playerFieldController(value: PlayerFieldController) {
        this._playerFieldController = value;
    }

    public get enemyFieldController() {
        return this._enemyFieldController;
    }
    public set enemyFieldController(value: EnemyFieldController) {
        this._enemyFieldController = value;
    }

    public set field(value: ITileFieldController) {
        this._field = value;
        this._fieldExt = new FieldControllerExtensions(this._field);
    }

    get field() {
        return super.field;
    }

    public get levelConfiguration() {
        return this._levelConfig;
    }
    public set levelConfiguration(value: LevelConfiguration) {
        this._levelConfig = value;
    }

    start() {
        this.debugView = new DebugViewForBot();
    }
}
