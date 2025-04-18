import { Tween, _decorator } from "cc";
import { Service } from "../services/Service";
import { SceneLoaderService } from "../services/SceneLoaderService";
import { GameManager } from "../game/GameManager";
import { LevelSelectorController } from "./LevelSelectorController";
import { Queue } from "../../scripts/Queue";
import { EffectsManager } from "../game/EffectsManager";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
const { ccclass, property } = _decorator;

const SCHEDULE_TIME = 1.5;

@ccclass("InGameLevelLoaderService")
export class InGameLevelLoaderService extends Service {
    private _sceneLoader: SceneLoaderService;
    private _gameManager: GameManager | null;
    private _lvlSelector: LevelSelectorController;
    private _task: (() => void) | null = null;
    private _effectsManager: EffectsManager | null;
    private _audio: AudioManagerService;
    private _wait = true;

    start() {
        this._sceneLoader = this.getServiceOrThrow(SceneLoaderService);
        this._gameManager = this.getService(GameManager);
        this._lvlSelector = this.getServiceOrThrow(LevelSelectorController);
        this._effectsManager = this.getService(EffectsManager);
        this._audio = this.getServiceOrThrow(AudioManagerService);

        this._task = null;
    }


    loadLevel(sender: object, levelName: string): void {
        this._sceneLoader.showLoaderScreen();

        this.runTask(
            () => {
                if (this._sceneLoader == null) throw Error("SceneLoader is null");
                const cfgAction = this._lvlSelector.getCfgByLvlName(levelName);

                if (cfgAction == null)
                    throw Error("No configuration for " + levelName + " level");

                Tween.stopAll();

                this._sceneLoader.loadGameScene("scene_game_field", cfgAction);
            }
        );
    }

    loadScene(sender: object, sceneName: string): void {
        this._sceneLoader.showLoaderScreen();

        this.runTask(
            () => {
                Tween.stopAll();

                this._sceneLoader.loadLevel(sceneName);
            }
        );
    }

    runTask(task: () => void) {

        this._audio.stop();

        if (this._gameManager != null) {
            this._gameManager.stop();
        }

        if (this._task == null) {
            this._task = task;

            this.scheduleOnce(() => this._wait = false, SCHEDULE_TIME)

        } else {
            throw new Error("Task already exists");
        }
    }

    update(dt: number): void {
        if (this._task != null &&
            this._wait == false &&
            (this._gameManager == null || !this._gameManager?.isStarted) &&
            (this._effectsManager == null || !this._effectsManager.effectIsRunning)) {
            this._wait = true;

            this._task();

            this._task = null;
        }
    }
}
