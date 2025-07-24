import { _decorator, director } from 'cc';
import { Service } from '../services/Service';
import { AudioConfigurator } from '../services/AudioConfigurator';

const { ccclass } = _decorator;

@ccclass('IntroSceneController')
export class IntroSceneController extends Service {
    private _audioConfigurator: AudioConfigurator;

    start() {
        this._audioConfigurator = AudioConfigurator.instance;

        this._audioConfigurator.applyList(this._audioConfigurator.levelMusicList);
    }

    public onStartButtonClick(): void {
        director.loadScene('MainMenu');
    }
}
