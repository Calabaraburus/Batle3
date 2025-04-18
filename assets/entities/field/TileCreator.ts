//  TileCreator.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, Component, instantiate, Node } from "cc";
import { FieldModel } from "../../models/FieldModel";
import { IObjectsCache } from "../../ObjectsCache/IObjectsCache";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { TileController } from "../tiles/TileController";
import { TileContollerListItem } from "./TileContollerListItem";
const { ccclass, property } = _decorator;

/**
 * This class is need to build tiles of different types (prefabs)
 */
@ccclass("TileCreator")
export class TileCreator extends Component {
  cache: IObjectsCache | null;

  @property(TileContollerListItem)
  tilePrefabs: TileContollerListItem[] = [];

  public create(name: string): Node | null | undefined {
    if (this.cache == null) {
      this.cache = ObjectsCache.instance;
    }

    const prefabs = this.tilePrefabs.filter((t) => {
      const names = t.name.split(";");
      let haveResult = false;
      names.forEach((n) => {
        if (n.trim() == name) {
          haveResult = true;
          return;
        }
      });

      if (haveResult) {
        return true;
      }

      return false;
    });

    if (prefabs.length > 0) {
      if (prefabs[0].prefabTypeName.startsWith("p_")) {
        return this.cache?.getObjectByPrefabName<TileController>(
          prefabs[0].prefabTypeName.toString().substring(2)
        )?.node;
      } else {
        return this.cache?.getObjectByName<TileController>(
          prefabs[0].prefabTypeName
        )?.node;
      }
    } else {
      return null;
    }
  }
}
