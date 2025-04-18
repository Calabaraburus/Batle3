import { CCString, _decorator } from "cc";
import { BonusModel } from "../../models/BonusModel";
import { EndLevelBonusModel } from "./EndLevelBonusModel";
const { ccclass, property } = _decorator;

@ccclass("EndLevelCardUpdateBonusModel")
export class EndLevelCardUpdateBonusModel extends EndLevelBonusModel {
  // constructor() {
  //   super();
  //   this.type = "CardSelectBonus";
  // }
  @property(CCString)
  cardMnemonic = "card";
  cardPrice = 0;
}
