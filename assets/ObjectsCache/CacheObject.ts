import { Component, EventTarget, _decorator, log } from "cc";
import { ICacheObject } from "./ICacheObject";
import { CacheBag, ObjectsCache } from "./ObjectsCache";
const { ccclass, property } = _decorator;

@ccclass("CacheObject")
export class CacheObject extends Component implements ICacheObject {
  public readonly destroyEvent: EventTarget = new EventTarget();
  private _bag: CacheBag;
  private _inCache = false;

  public get inCache() { return this._inCache; }

  public setCacheBag(cacheBag: CacheBag) {
    this._bag = cacheBag;
  }

  private _virtual: boolean = false;

  public get virtual() {
    return this._virtual;
  }

  public set virtual(value: boolean) {
    this._virtual = value;

    if (this.node.active == true && this._virtual == true) {
      this.node.active = false;
    }
  }

  cacheCreate(): void {
    this._inCache = false;
    if (!this._virtual) this.node.active = true;
  }

  public cacheDestroy(): void {

    if (this.inCache) {
      return;
    }

    try {
      if (this.node.active) {
        this.node.active = false;
      }

      this._bag.destroyObject(this);
      this._inCache = true;
    } catch (error) {

    }
  }
}
