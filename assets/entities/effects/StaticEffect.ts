import { _decorator, Node, Graphics, director } from "cc";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { CardEffect } from "./CardEffect";
import { Service } from "../services/Service";
import { EffectsService } from "../services/EffectsService";
import { Line } from "./Line";
const { ccclass, property } = _decorator;

@ccclass("StaticEffect")
export class StaticEffect extends Service {
  private _cache: ObjectsCache | null;
  private _effectsNode: Node | null;
  private _graphics: Graphics;

  public get graphics() {
    return this._graphics;
  }

  get effectsNode() {
    return this._effectsNode;
  }

  public get cache() {
    return this._cache;
  }

  start() {
    const scene = director.getScene();
    const gw = scene?.getChildByPath("LevelView/MainField/GraphicsView");
    if (gw == null) return;
    const tg = gw?.getComponent(Graphics);

    if (tg == null) return;
    this._graphics = tg;

    this._cache = ObjectsCache.instance;
    const effects = this.getService(EffectsService);

    if (effects != null) {
      this._effectsNode = effects.effectsNode;
    }
  }
}
