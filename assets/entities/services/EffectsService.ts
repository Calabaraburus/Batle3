import { director, _decorator, Node } from "cc";
import { Service } from "./Service";
const { ccclass } = _decorator;

@ccclass("EffectsService")
export class EffectsService extends Service {
  private _effectsNode: Node | null;

  public get effectsNode(): Node | null {
    return this._effectsNode;
  }

  start() {
    const scene = director.getScene();
    if (scene != undefined) {
      this._effectsNode = scene.getChildByPath("LevelView/MainField/ParticleEffects")!;
    }
  }
}
