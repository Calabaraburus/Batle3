import { _decorator } from "cc";
import { Service } from "./Service";
import { PlayerFieldController } from "../playerField/PlayerFieldController";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { PlayerModel } from "../../models/PlayerModel";
import { CardController } from "../playerField/cardField/CardController";
const { ccclass, property } = _decorator;

@ccclass("PlayerService")
export class PlayerService extends Service {
  private levelConfiguration: LevelConfiguration;

  @property({ type: PlayerFieldController })
  playerFieldController: PlayerFieldController;

  public get playerModel(): PlayerModel {
    return this.levelConfiguration.playerModel;
  }

  private _life: number;

  public get life(): number {
    return this._life;
  }

  public set life(value: number) {
    this._life = value;
    this.playerFieldController.PlayerLife = value;
  }

  public get cards(): CardController[] {
    return this.playerFieldController.cardField.cards;
  }

  start() {
    const tmp = this.getService(LevelConfiguration);

    if (tmp == null) throw Error("LevelConfiguration service not found");

    this.levelConfiguration = tmp;

    this.playerFieldController.playerModel =
      this.levelConfiguration.playerModel;

    this.playerFieldController.PlayerMaxLife =
      this.levelConfiguration.playerModel.lifeMax;

    this.life = this.levelConfiguration.playerModel.life;
  }
}
