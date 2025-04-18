import { CCString, _decorator } from "cc";
import { EndLevelBonusModel } from "./EndLevelBonusModel";
const { ccclass, property } = _decorator;

@ccclass("EndLevelLifeBonusModel")
export class EndLevelLifeBonusModel extends EndLevelBonusModel {
  @property(CCString)
  life = "10";
}
