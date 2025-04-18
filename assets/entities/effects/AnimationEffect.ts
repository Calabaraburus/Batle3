import { Animation, AnimationState, _decorator, log } from "cc";
const { ccclass, property } = _decorator;
import { CacheObject } from "../../ObjectsCache/CacheObject";

@ccclass("AnimationEffect")
export class AnimationEffect extends CacheObject {
  private isplaying = false;

  @property({ type: Animation })
  animations: Animation[] = [];

  play() {
    this.animations.forEach((a) => {
      a.resume();
      a.play();
    });
    this.isplaying = true;
  }

  protected update(dt: number): void {
    if (!this.isplaying) return;

    let isplaying = false;

    this.animations.forEach((a) => {
      if (isplaying) return;
      if (a.defaultClip == null) return;

      const state = a.getState(a.defaultClip?.name);
      isplaying = state.isPlaying;
    });

    if (!isplaying) {
      //   this.stop();
    }
  }

  stop() {
    this.isplaying = false;
    this.animations.forEach((a) => {
      a.stop();
    });

    this.cacheDestroy();
  }
}
