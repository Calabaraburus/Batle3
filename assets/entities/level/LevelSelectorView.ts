//  LevelSelectorView.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { Component, _decorator } from "cc";
import { ILevelSelectorController } from "./ILevelSelectorController";
import { ILevelSelectorView } from "./ILevelSelectorView";
import { LevelSelectorController } from "./LevelSelectorController";
const { ccclass, property } = _decorator;

@ccclass("LevelSelectorView")
export class LevelSelectorView extends Component implements ILevelSelectorView {
  @property({ type: LevelSelectorController })
  controller: LevelSelectorController;

}
