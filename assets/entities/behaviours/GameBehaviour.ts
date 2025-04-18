import { _decorator, debug, director, js } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { helpers } from "../../scripts/helpers";
import { EnemyFieldController } from "../enemyField/EnemyFieldController";
import { FieldAnalyzer } from "../field/FieldAnalizer";
import { FieldController } from "../field/FieldController";
import { GameManager } from "../game/GameManager";
import { LevelController } from "../level/LevelController";
import { PlayerFieldController } from "../playerField/PlayerFieldController";
import { DataService } from "../services/DataService";
import { BombTileController } from "../tiles/BombTile/BombTileController";
import { DebugView } from "../ui/debugger/DebugView";
import { Behaviour } from "./Behaviour";
import { CardService } from "../services/CardService";
import { LevelModel } from "../../models/LevelModel";
import { GameState } from "../game/GameState";
import { EffectsService } from "../services/EffectsService";
import { EffectsManager } from "../game/EffectsManager";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { CardsBehaviour } from "../tiles/Behaviours/CardsBehaviour";
import { EOTInvoker } from "../game/EOTInvoker";
import { FieldControllerExtensions } from "../field/FieldExtensions";
const { ccclass } = _decorator;

@ccclass("GameBehaviour")
export class GameBehaviour extends Behaviour {
  private _dataService: DataService;
  private _cardService: CardService
  private _objectsCache: ObjectsCache;
  private _levelModel: LevelModel;
  private _gameState: GameState;
  private _effectsService: EffectsService;
  private _audioManager: AudioManagerService;
  private _effectsManager: EffectsManager;
  private _eotInvoker: EOTInvoker;

  public get gameState() { return this._gameState; }

  public get currentPlayerModel() {
    return this._cardService.getCurrentPlayerModel();
  }

  public get currentOponentModel() {
    return this._cardService.getOponentModel();
  }

  public get dataService() {
    return this._dataService;
  }

  public get objectsCache() {
    return this._objectsCache;
  }

  public get levelController() {
    return this._dataService?.levelController;
  }

  public get levelModel() {
    return this._levelModel;
  }

  public get fieldAnalizer() {
    return this._dataService?.fieldAnalizer;
  }

  public get botModel() {
    return this._dataService?.botModel;
  }

  public get playerModel() {
    return this._dataService?.playerModel;
  }

  public get playerFieldController() {
    return this._dataService?.playerFieldController;
  }

  public get enemyFieldController() {
    return this._dataService?.enemyFieldController;
  }

  public get effectsService() {
    return this._effectsService;
  }

  public get audioManager() {
    return this._audioManager;
  }

  public get effectsManager() {
    return this._effectsManager;
  }

  get field() {
    return this._dataService?.field;
  }

  get fieldViewController() {
    return this._dataService.fieldController;
  }

  get fieldExt() {
    return this._dataService?.fieldExt;
  }


  get debug() {
    return this._dataService?.debugView;
  }

  public get cardService() {
    return this._cardService;
  }

  public get eotInvoker() {
    return this._eotInvoker;
  }

  public Setup(objectsCache: ObjectsCache,
    cardService: CardService,
    dataService: DataService,
    levelModel: LevelModel,
    gameState: GameState,
    effectsService: EffectsService,
    effectsManager: EffectsManager,
    audioManager: AudioManagerService,
    eotInvoker: EOTInvoker) {

    this._objectsCache = objectsCache;
    this._cardService = cardService;
    this._dataService = dataService;
    this._levelModel = levelModel;
    this._gameState = gameState;
    this._effectsService = effectsService;
    this._audioManager = audioManager;
    this._effectsManager = effectsManager;
    this._eotInvoker = eotInvoker;
  }

  run(): void {
    this.debug?.log(`behave: '${this.serviceType}' run`);

    try {
      this.singleRun();
    } catch (e: unknown) {
      if (typeof e === "string") {
        this.debug?.log(
          `behave: '${this.serviceType}' error: '${e.toString()}'`
        );
      } else if (e instanceof Error) {
        this.debug?.log(`behave: '${this.serviceType}' error: '${e.message}'`);
      } else {
        this.debug?.log(`behave: '${this.serviceType}' error: unknown`);
      }
    }

    this.stop();
  }

  singleRun() {
    throw Error("not implemented method");
  }

  clone(): Behaviour {
    const result = new GameBehaviour();

    this.cloneInternal(result);

    return result;
  }

  protected cloneInternal(b: Behaviour): void {

    if (b instanceof (GameBehaviour)) {
      b._dataService = this._dataService;
      b._cardService = this._cardService;
      b._objectsCache = this._objectsCache;
      b._levelModel = this._levelModel;
      b._gameState = this._gameState;
      b._effectsService = this._effectsService;
      b._audioManager = this._audioManager;
      b._effectsManager = this._effectsManager;
      b._eotInvoker = this._eotInvoker;

    }

    super.cloneInternal(b);
  }
}
