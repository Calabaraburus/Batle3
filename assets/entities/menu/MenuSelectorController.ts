import { _decorator, assert, CCFloat, director, math, Node } from "cc";
import { MainMenu } from "./MainMenu";
import { LoaderScreen } from "./LoaderScreen";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { SettingsLoader } from "../services/SettingsLoader";
import { GameState } from "../game/GameState";
import { GameParameters } from "../game/GameParameters";
import { MenuOptionsItem } from "./MenuOptionsItem";
import { Window } from "../ui/window/Window";
import { Service } from "../services/Service";
import { SceneLoaderService } from "../services/SceneLoaderService";
import { GameManager } from "../game/GameManager";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { LevelSelectorController } from "../level/LevelSelectorController";
import { InGameLevelLoaderService } from "../level/InGameLevelLoaderService";
const { ccclass, property } = _decorator;

@ccclass("MenuSelectorController")
export class MenuSelectorController extends Service {
  private _aManager: AudioManagerService | null | undefined;

  @property(Node)
  sections: Node[] = [];

  @property(Node)
  soundCross: Node;

  @property(Node)
  musicCross: Node;

  @property(Node)
  soundCross2: Node;

  @property(Node)
  musicCross2: Node;

  @property(Node)
  soundBtns: Node[] = [];

  @property(Node)
  musicBtns: Node[] = [];

  @property(CCFloat)
  volumeList: number[] = [0, 0.2, 0.57, 1];

  settingsLoader: SettingsLoader;
  parameters: GameParameters;
  private _gameManager: GameManager | null;
  private _levelConfig: LevelConfiguration;
  private _levelSelector: LevelSelectorController;
  private _inGameLoader: InGameLevelLoaderService | null;

  start(): void {

    
    this._aManager = AudioManagerService.instance;
    //this._sceneLoader = this.getServiceOrThrow(SceneLoaderService);
    this._inGameLoader = this.getService(InGameLevelLoaderService);
    this._gameManager = this.getService(GameManager);
    // this._aManager = this.getService(AudioManagerService);
    this._levelConfig = this.getServiceOrThrow(LevelConfiguration);
    this._levelSelector = this.getServiceOrThrow(LevelSelectorController);

    //    assert(this._aManager != null, "Can't find AudioManagerService");

    //  this._aManager.playMusic("start_menu");

    const tService = this.getService(SettingsLoader);

    assert(tService != null, "SettingsLoader can't be found");

    this.settingsLoader = tService;

    this.parameters = this.settingsLoader.gameParameters;

    this.musicCross2.active = false;
    this.soundCross2.active = false;

    this.settingSound(this, this.getvolumeIdByVal(this.parameters.soundLevel).toString());
    this.settingMusic(this, this.getvolumeIdByVal(this.parameters.musicLevel).toString());
  }

  getvolumeIdByVal(volume: number) {
    for (let i = 0; i < this.volumeList.length; i++) {
      const value = this.volumeList[i];
      if (value == volume) {
        return i;
      }
    }

    return 0;
  }

  onLoad(): void {
    this._aManager = this.getComponent(AudioManagerService);
  }

  openSectionMenu(sender: object, sectionMenu: string): void {
    this.sections.forEach((section) => {
      if (section.name != sectionMenu) {
        section.active = false;
      } else {
        section.active = true;
      }
    });
  }

  loadScene(sender: object, sceneName: string): void {
    this._inGameLoader?.loadScene(this, sceneName);
  }

  reloadMission() {
    this._inGameLoader?.loadLevel(this, this._levelConfig.levelName);
  }

  settingSound(sender: object, volumeIdStr: string) {
    const volumeId = parseInt(volumeIdStr);
    const volume = this.volumeList[volumeId];

    this._aManager?.changeSoundVolume(volume);

    this.parameters.soundLevel = volume;
    this.settingsLoader.saveParameters();

    this.setCross(this.soundBtns, this.soundCross, this.soundCross2, volumeId);
  }

  settingMusic(sender: object, volumeIdStr: string) {
    const volumeId = parseInt(volumeIdStr);
    const volume = this.volumeList[volumeId];

    this._aManager?.changeMusicVolume(volume);

    this.parameters.musicLevel = volume;
    this.settingsLoader.saveParameters();

    this.setCross(this.musicBtns, this.musicCross, this.musicCross2, volumeId);
  }

  setCross(btns: Node[], cross: Node, cross2: Node, volumeId: number) {
    const btn = btns[volumeId];
    cross.position = btn.position.clone();

    if (volumeId == 0) {
      cross.active = false;
      cross2.active = true;
    } else {
      cross.active = true;
      cross2.active = false;
    }
  }
}
