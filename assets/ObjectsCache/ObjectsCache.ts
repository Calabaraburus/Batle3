//  ObjectCache - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  _decorator,
  Component,
  instantiate,
  Node,
  __private,
  js,
} from "cc";
import { CacheObject } from "./CacheObject";
import { ICacheObject } from "./ICacheObject";
import { IObjectsCache } from "./IObjectsCache";
import { Queue } from "../scripts/Queue";
import { CacheProtoItem } from "./CacheProtoItem";
const { ccclass, property } = _decorator;

/**
 * This class is need to create game objects and reuse them after destruction
 */
@ccclass("ObjectsCache")
export class ObjectsCache extends Component implements IObjectsCache {
  private static _instance: ObjectsCache | null = null;
  public static get instance(): ObjectsCache | null {
    return this._instance;
  }

  private _nodes: Node[] | null = null;

  private _objectBags: Map<string, CacheBag> = new Map<string, CacheBag>();

  @property(CacheProtoItem)
  prototypes: CacheProtoItem[] = [];

  public get size() {
    let result = 0;

    this._objectBags.forEach(b => { result += b.bagDestroied.length + b.bagNotDestroied.size });

    return result;
  }

  onLoad() {
    ObjectsCache._instance = this;
  }

  prefabsToNodes() {
    if (this._nodes == null) {
      this._nodes = [];

      this.prototypes.forEach((p) => {
        const instance = instantiate(p.prefab);
        if (this._nodes != null) {
          this._nodes.push(instance);
        }
      });
    }
  }

  public getObject<T extends ICacheObject>(
    classConstructor: __private._types_globals__Constructor<T>
  ): T | null | undefined {
    return this.getObjectByName(classConstructor.name);
  }

  public getObjectByName<T extends ICacheObject>(
    typeName: string
  ): T | null | undefined {
    this.prefabsToNodes();
    let bag: CacheBag | null | undefined = null;

    if (this._objectBags.has(typeName)) {
      bag = this._objectBags.get(typeName);
    } else {
      this._nodes?.forEach((n, i) => {
        if (
          n.components.find((c) => js.getClassName(c) == typeName) !== undefined
        ) {
          bag = new CacheBag();
          bag.prototype = this.prototypes[i];
          this._objectBags.set(typeName, bag);
          return;
        }
      });
    }

    const result = bag?.get();
    result?.cacheCreate();
    return result as T | null | undefined;
  }

  public getObjectByPrefabName<T extends ICacheObject>(
    prefabName: string
  ): T | null | undefined {
    this.prefabsToNodes();
    let bag: CacheBag | null | undefined = null;

    if (this._objectBags.has("p_" + prefabName)) {
      bag = this._objectBags.get("p_" + prefabName);
    } else {
      this.prototypes?.forEach((p, i) => {
        if (p.prefab.name == prefabName) {
          bag = new CacheBag();
          bag.prototype = p;
          this._objectBags.set("p_" + prefabName, bag);
          return;
        }
      });
    }

    const result = bag?.get();
    result?.cacheCreate();
    return result as T | null | undefined;
  }
}

export class CacheBag {
  public prototype: CacheProtoItem;
  public bagNotDestroied: Set<CacheObject> = new Set<CacheObject>();
  public bagDestroied: Queue<CacheObject> = new Queue<CacheObject>();

  public destroyObject(obj: CacheObject) {
    this.bagNotDestroied.delete(obj);
    this.bagDestroied.enqueue(obj);
  }

  public size(): number {
    return this.bagNotDestroied.size + this.bagDestroied.length;
  }

  public get(): CacheObject | null | undefined {
    if (this.bagDestroied.isEmpty || this.size() < this.prototype.minCount) {
      const obj = instantiate(this.prototype.prefab);
      const result = obj.getComponent(CacheObject);

      if (result == null) {
        return null;
      }
      result.setCacheBag(this);

      this.bagNotDestroied.add(result);

      return result;
    } else {
      const result = this.bagDestroied.dequeue();
      this.bagNotDestroied.add(result);
      return result;
    }
  }
}
