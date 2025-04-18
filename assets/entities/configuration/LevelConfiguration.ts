import { _decorator, CCString, Component, Node } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { EndLevelBonusModel } from "./EndLevelBonusModel";
import { EndLevelLifeBonusModel } from "./EndLevelLifeBonusModel";
import { EndLevelCardUpdateBonusModel } from "./EndLevelCardUpdateBonusModel";
import { EndLevelCardSelectorBonusModel } from "./EndLevelCardSelectorBonusModel";
import { BonusModel } from "../../models/BonusModel";
const { ccclass, property } = _decorator;

@ccclass("LevelConfiguration")
export class LevelConfiguration extends Component {
  private _playerModels: PlayerModel[];

  @property(CCString)
  playerHeroName = "bear";

  @property(CCString)
  botHeroName = "lion";

  endLevelBonuses: any[] = [];

  public levelName: string;

  private _playerModel: PlayerModel;
  private _bonuses: BonusModel[] | undefined;

  public get bonuses() {
    return this._bonuses;
  }

  public get playerModel(): PlayerModel {
    return this._playerModel;
  }

  private _botModel: PlayerModel;
  public get botModel(): PlayerModel {
    return this._botModel;
  }

  private _bonusLevelModels: EndLevelBonusModel[];

  start() {
    this._playerModels = this.getComponentsInChildren(PlayerModel);

    this._bonuses = this.node
      .getChildByName("BonusModels")
      ?.getComponentsInChildren(BonusModel);
  }

  updateData() {
    this._playerModel = this.getModel(this.playerHeroName);
    this._botModel = this.getModel(this.botHeroName);
  }

  public getModel(name: string): PlayerModel {
    const result = this._playerModels.find((pm) => pm.playerName == name);

    if (result == null) throw Error(`No player model with name: ${name}`);

    return result;
  }

  public getBonus(name: string): BonusModel {
    const result = this._bonuses?.find((bonus) => bonus.mnemonic == name);

    if (result == null) throw Error(`No bonus model with name: ${name}`);

    return result;
  }
}


