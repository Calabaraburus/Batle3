import { _decorator, Component, Node, ParticleSystem, sys } from "cc";
import { CacheObject } from "../../ObjectsCache/CacheObject";
const { ccclass, property } = _decorator;

@ccclass("CardEffect")
export class CardEffect extends CacheObject {
  @property({ type: ParticleSystem })
  systems: ParticleSystem[] = [];

  cacheCreate() {
    super.cacheCreate();
  }

  play() {
    try {
      this.systems.forEach((s) => {
        if (s) s.play();
      });
    } catch (error) {

    }

  }

  stop() {
    try {
      this.systems.forEach((s) => {
        if (s) s.stop();
      });
    } catch (error) {

    }
  }

  stopEmmit() {
    try {
      this.systems.forEach((s) => {
        if (s) s.stopEmitting();
      });
    } catch (error) {

    }
  }

  cacheDestroy() {
    this.stop();

    super.cacheDestroy();
  }
}
