import { CCString, _decorator } from "cc";
import { BonusModel } from "../../models/BonusModel";
import { EndLevelBonusModel } from "./EndLevelBonusModel";
const { ccclass, property } = _decorator;

@ccclass("EndLevelCardSelectorBonusModel")
export class EndLevelCardSelectorBonusModel extends EndLevelBonusModel {
  // constructor() {
  //   super();
  //   this.type = "CardSelectBonus";
  // }
  @property(CCString)
  cardOne = "card";
  cardOnePrice = 0;

  @property(CCString)
  cardTwo = "card";
  cardTwoPrice = 0;
}
