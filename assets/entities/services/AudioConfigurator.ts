import { _decorator, CCString, Component, game, Node, randomRangeInt, sys } from "cc";
import { Service } from "./Service";
import { SettingsLoader } from "./SettingsLoader";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { StarTileController } from "../tiles/StarTile/StarTileController";
const { ccclass, property } = _decorator;

@ccclass("AudioConfigurator")
export class AudioConfigurator extends Service {
    private _settingsLoader: SettingsLoader;
    private _audio: AudioManagerService;

    public get audioManager() { return this._audio; }

    @property(CCString)
    levelMusicList: string[] = [];

    @property(CCString)
    mapMusicList: string[] = [];

    @property(CCString)
    endGameMusicList: string[] = [];

    start(): void {
        this._settingsLoader = this.getServiceOrThrow(SettingsLoader);
        this._audio = this.getServiceOrThrow(AudioManagerService);

        this._audio.changeMusicVolume(this._settingsLoader.gameParameters.musicLevel);
        this._audio.changeSoundVolume(this._settingsLoader.gameParameters.soundLevel);

        this.applyList(["music_intro"]);
    }

    applyList(list: string[]) {
        let idList = [...Array(list.length).keys()];
        const resList: string[] = [];

        list.forEach(() => {
            const tid = randomRangeInt(0, idList.length);
            resList.push(list[idList[tid]]);
            idList.slice(tid, 1);
        });

        this._audio.currentMusicList = resList;
    }
}
