import { _decorator, Component, game, Node, sys } from "cc";
import { GameParameters } from "../game/GameParameters";
import { GameState } from "../game/GameState";
import { Service } from "./Service";
import { GameConfigurationModel } from "../game/GameConfiguration";
import { PlayerCurrentGameState } from "./PlayerCurrentGameState";
const { ccclass, property } = _decorator;

@ccclass("SettingsLoader")
export class SettingsLoader extends Service {
  //private _gameState: GameState;
  private _gameParameters: GameParameters;
  private _gameConfiguration: GameConfigurationModel;
  private _playerCurrentState: PlayerCurrentGameState;

  public get gameConfiguration(): GameConfigurationModel {
    return this._gameConfiguration;
  }

  public get gameParameters(): GameParameters {
    return this._gameParameters;
  }

  public get playerCurrentGameState(): PlayerCurrentGameState {
    return this._playerCurrentState;
  }

  constructor() {
    super();
    this.loadParameters();
    this.loadPlayerCurrentGameState();
    this.loadGameConfiguration();
  }

  public getParametersJson() {
    return sys.localStorage.getItem("gameParameters");
  }

  public getGameConfigurationJson() {
    return sys.localStorage.getItem("gameConfiguration");
  }

  public getPlayerCurrentGameStateJson() {
    return sys.localStorage.getItem("gameState");
  }

  public loadGameConfiguration() {
    const data = sys.localStorage.getItem("gameConfiguration");

    if (data == null) {
      this._gameConfiguration = GameConfigurationModel.getDefaultConfig();
    } else {
      this._gameConfiguration = JSON.parse(data);
    }

    return this._gameConfiguration;
  }

  public loadParameters(): GameParameters {
    const data = sys.localStorage.getItem("gameParameters");

    if (data == null) {
      this._gameParameters = new GameParameters();
    } else {
      this._gameParameters = JSON.parse(data);

      if (this._gameParameters.language == undefined) {
        var tmp = this._gameParameters;
        this._gameParameters = new GameParameters();
        this._gameParameters.editMode = tmp.editMode;
        this._gameParameters.musicLevel = tmp.musicLevel;
        this._gameParameters.soundLevel = tmp.soundLevel;

      }

    }

    return this._gameParameters;
  }

  public saveConfiguration() {
    sys.localStorage.setItem(
      "gameConfiguration",
      JSON.stringify(this._gameConfiguration)
    );
  }

  public removeConfiguration() {
    sys.localStorage.removeItem("gameConfiguration");
    this.loadGameConfiguration();
  }

  public removePlayerCurrentGameState() {
    sys.localStorage.removeItem("gameState");
    this.loadPlayerCurrentGameState()
  }

  public removeGameParameters() {
    sys.localStorage.removeItem("gameParameters");
    this.loadParameters()
  }

  public saveParameters() {
    sys.localStorage.setItem(
      "gameParameters",
      JSON.stringify(this._gameParameters)
    );
  }

  public loadPlayerCurrentGameState(): PlayerCurrentGameState {
    const data = sys.localStorage.getItem("gameState");
    this._playerCurrentState = new PlayerCurrentGameState();

    if (data != null) {
      Object.assign(this._playerCurrentState, JSON.parse(data));
    } else {
      this._playerCurrentState = PlayerCurrentGameState.getDefault();
    }

    return this._playerCurrentState;
  }

  public saveGameState() {
    sys.localStorage.setItem("gameState", JSON.stringify(this._playerCurrentState));
  }
}

