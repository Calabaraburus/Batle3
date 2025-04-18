import { Service } from "../services/Service";
import { PlayerModel } from "../../models/PlayerModel";
import { PlayerInfoWindow } from "./PlayerInfoWindow";
import { Button, _decorator, find, Node } from "cc";
import { WindowManager } from "./WindowManager";
import { PlayerService } from "../services/PlayerService";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
const { ccclass, property } = _decorator;

@ccclass("PlayerInfoService")
export class PlayerInfoService extends Service {
  private _wManager: WindowManager | null;
  private _levelConfiguration: LevelConfiguration | null;

  onTouch() {
    this._levelConfiguration = this.getService(LevelConfiguration);
    this._wManager = this.getService(WindowManager);
    if (!this._levelConfiguration) return;
    const pModel = this._levelConfiguration.botModel;
    this._wManager?.showPlayerWindow(pModel);
  }
}
