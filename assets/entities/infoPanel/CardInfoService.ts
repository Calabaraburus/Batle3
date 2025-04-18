import { WindowManager } from "./WindowManager";
import { PlayerService } from "../services/PlayerService";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { BonusModel } from "../../models/BonusModel";
import { _decorator, find } from "cc";
import { Service } from "../services/Service";
const { ccclass, property } = _decorator;

@ccclass("CardInfoService")
export class CardInfoService extends Service {
  private _model: BonusModel;
  private _wManager: WindowManager | null;

  get model(): BonusModel {
    return this._model;
  }

  setModel(model: BonusModel) {
    this._model = model;
  }

  onTouch() {
    this._wManager = this.getService(WindowManager);
    this._wManager?.showCardWindow(this.model);
  }
}
