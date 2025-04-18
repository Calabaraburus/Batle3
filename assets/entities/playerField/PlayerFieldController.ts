import { _decorator, Component, Label, Sprite } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { CardController } from "./cardField/CardController";
import { CardFieldController } from "./cardField/CardFieldController";
import { LoadLine } from "../ui/loadLine/LoadLine";
import { LoseLifeEffect } from "./loseLifeEffect/loseLifeEffect";
import { loseLifeLabel } from "./loseLifeEffect/loseLifeLabel";
const { ccclass, property } = _decorator;

@ccclass("PlayerFieldController")
export class PlayerFieldController extends Component {
  @property(PlayerModel)
  playerModel: PlayerModel;

  @property(CardFieldController)
  cardField: CardFieldController;

  @property(Label)
  lblMana: Label;

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

  public get PlayerMaxLife(): number {
    return this.playerLifeLine.Max;
  }

  public set PlayerMaxLife(value: number) {
    this.playerLifeLine.Max = value;
  }

  start() {
    this.cardField.node.on(
      "selectedCardChanged",
      this.selectedCardChanged,
      this
    );
    this.updateData();
  }

  public selectedCardChanged(card: CardController | null) {
    if (card != null) {
      this.playerModel.setBonus(card.model);
    } else {
      this.playerModel.unSetBonus();
    }
  }

  public updateData() {
    if (this.playerModel == null) return;
    this.playerImage.spriteFrame = this.playerModel.heroImage;
    this.playerLifeLine.Max = this.playerModel.lifeMax;

    if (this.playerLifeLine.Value > this.playerModel.life) {
      this.loseLifeEffect.playEffect(this.playerModel.life - this.playerLifeLine.Value);
    }

    this.playerLifeLine.Value = this.playerModel.life;
    this.cardField.bonuses = this.playerModel.bonuses;
    this.cardField.updateData();
  }
}
