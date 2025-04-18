import { Service } from "../services/Service";
import { BonusModel } from "../../models/BonusModel";
import { PlayerModel } from "../../models/PlayerModel";
import { PlayerInfoWindow } from "./PlayerInfoWindow";
import { CardInfoWindow } from "./CardInfoWindow";
import { _decorator } from "cc";
import { PlayerInfoService } from "./PlayerInfoService";
import { StartLevelWindow } from "../ui/window/StartLevelWindow";
import { SettingsLoader } from "../services/SettingsLoader";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { InfoWindow } from "../ui/window/InfoWindow";
const { ccclass, property } = _decorator;

@ccclass("WindowManager")
export class WindowManager extends Service {
  public showPlayerWindow() {
    const wnd = this.getService(InfoWindow);
    const config = this.getService(LevelConfiguration);

    if (wnd && config) {
      wnd.showWindow(this, "lvl:" + config.levelName);
    }
  }

  public showCardWindow(cardModel: BonusModel | undefined) {
    const wnd = this.getService(InfoWindow);
    const config = this.getService(LevelConfiguration);

    if (!cardModel) return;

    if (wnd && config) {
      wnd.showWindow(this, "lvl:" + config.levelName);
      wnd.showPlayerCardInfoByModel(cardModel);
    }
  }

  public cardWindowIsOpened(): boolean {
    const wnd = this.getService(InfoWindow);
    return wnd ? wnd.isOpened : false;
  }
}
