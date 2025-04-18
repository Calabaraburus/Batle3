//  TileContollerListItem.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, Prefab, CCString } from "cc";
const { ccclass, property } = _decorator;

@ccclass("TileContollerListItem")
export class TileContollerListItem {
  @property(CCString)
  name: string;

  @property(CCString)
  prefabTypeName: string;
}
