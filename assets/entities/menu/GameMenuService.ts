import { _decorator } from "cc";
import { Service } from "../services/Service";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";

const { ccclass, property } = _decorator;

@ccclass("GameMenuService")
export class GameMenuService extends Service {
  private _audioManager: AudioManagerService | null;

  start() {
    this._audioManager = this.getService(AudioManagerService);
  }

  get audioManager() {
    return this._audioManager;
  }
}

