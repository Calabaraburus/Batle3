import { _decorator, Component, Node, debug, log, Label, Sprite } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { LoadLine } from "../ui/loadLine/LoadLine";
import { LoseLifeEffect } from "../playerField/loseLifeEffect/loseLifeEffect";
const { ccclass, property } = _decorator;

@ccclass("EnemyFieldController")
export class EnemyFieldController extends Component {

  private _playEffect = true;

  @property(PlayerModel)
  playerModel: PlayerModel;

  @property(Label)
  lblName: Label;

  /** Player life line node */
  @property({ type: LoadLine })
  playerLifeLine: LoadLine;

  @property(Sprite)
  playerImage: Sprite;

  @property(LoseLifeEffect)
  loseLifeEffect: LoseLifeEffect;

  private playerLife: number;

  public get PlayerLife(): number {
    return this.playerLife;
  }

  public set PlayerLife(value: number) {
    this.playerLife = value;
    this.playerLifeLine.Value = value;

  }

  public turnOffEffects(turnoff = true) {
    this._playEffect = !turnoff;
  }

  public get PlayerMaxLife(): number {
    return this.playerLifeLine.Max;
  }

  public set PlayerMaxLife(value: number) {
    this.playerLifeLine.Max = value;
  }

  public updateData(): void {
    log("[EnemyFieldController] start data update");

    this.playerImage.spriteFrame = this.playerModel.heroImage;
    this.playerLifeLine.Max = this.playerModel.lifeMax;
    if (this.playerLifeLine.Value > this.playerModel.life && this._playEffect) {
      this.loseLifeEffect.playEffect(this.playerModel.life - this.playerLifeLine.Value);
    }
    this.playerLifeLine.Value = this.playerModel.life;
  }
}
