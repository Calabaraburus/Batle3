//  IObjectsCache.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras
import { __private } from "cc";
import { ICacheObject } from "./ICacheObject";

export interface IObjectsCache {
  getObject<T extends ICacheObject>(
    classConstructor: __private._types_globals__Constructor<T>
  ): T | null | undefined;

  getObjectByName<T extends ICacheObject>(
    typeName: string
  ): T | null | undefined;

  getObjectByPrefabName<T extends ICacheObject>(
    prefabName: string
  ): T | null | undefined;

}
