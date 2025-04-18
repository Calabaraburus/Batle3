import { CCBoolean, _decorator, assetManager, director } from "cc";
import { Service } from "./Service";
import { LoaderScreen } from "../menu/LoaderScreen";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { Queue } from "../../scripts/Queue";
import { DEBUG } from "cc/env";
import { IN_DEBUG } from "../../globals/globals";
import { AudioManager } from "../../soundsPlayer/AudioManager";
const { ccclass, property } = _decorator;

@ccclass("SceneLoaderService")
export class SceneLoaderService extends Service {
  loaderScreen: LoaderScreen;

  @property(CCBoolean)
  persThisNode: boolean = true;

  private _tasksQueue: Queue<() => void> = new Queue<() => void>();

  start() {
    if (IN_DEBUG()) {
      const am = assetManager;
      am.assets.forEach(a => {
        const p = a.nativeUrl;

        console.log();

      });
    }

    if (this.persThisNode) {
      director.addPersistRootNode(this.node);

      const tmp = this.node?.getComponentInChildren(LoaderScreen);
      if (tmp == null) throw Error("LevelSelector is null");
      this.loaderScreen = tmp;
    }

    director.preloadScene("LvlScene");
    director.preloadScene("scene_game_field");
  }

  showLoaderScreen() {
    this.loaderScreen.show();
  }

  loadLevel(levelName: string): void {
    this.runTaskForScreen(() => {
      director.loadScene(levelName, (e) => {
        if (e) this.loaderScreen.errorTxt.string = e.message;
        this.loaderScreen.hide();
        this.loaderScreen.wndIsShowedEvent.off("wndIsShowed");
      });
    });
  }

  loadLevelEventData(event: Event, levelName: string): void {
    AudioManager.Clear();
    this.loadLevel(levelName);
  }

  runTaskForScreen(task: () => void) {
    AudioManager.Clear();

    if (this.loaderScreen.isShowed) {
      this._tasksQueue.enqueue(() => {
        task();
      });
    } else {
      this.loaderScreen.wndIsShowedEvent.off("wndIsShowed");
      this.loaderScreen.wndIsShowedEvent.on("wndIsShowed", () => {
        this._tasksQueue.enqueue(() => {
          task();
        });
      });

      this.loaderScreen.show();
    }
  }

  loadLevelNoScreen(event: Event, levelName: string): void {
    director.getScene()?.children.forEach(n => n.pauseSystemEvents(true));
    AudioManager.Clear();
    director.preloadScene(levelName, () => {
      director.loadScene(levelName);
    });
  }

  loadGameScene(
    sceneName = "mainGameLevel",
    configurate: (config: LevelConfiguration) => void
  ) {
    AudioManager.Clear();
    this.runTaskForScreen(() => {
      director.loadScene(sceneName, (e, s) => {
        if (e) this.loaderScreen.errorTxt.string = e.message;

        if (configurate != null) {
          const lvlConfig = this.getComponentInChildren(LevelConfiguration);

          if (lvlConfig != null) {
            configurate(lvlConfig);
          }
        }

        this.loaderScreen.hide();
      });
    });
  }

  protected update(dt: number): void {
    if (!this._tasksQueue.isEmpty) {
      const task = this._tasksQueue.dequeue();
      task();
    }
  }
}
