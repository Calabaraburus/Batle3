import { Label, Sprite } from "cc";
import { BonusModel } from "../../models/BonusModel";
import { PopupWindow } from "./PopupWindow";
import { _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CardInfoWindow")
export class CardInfoWindow extends PopupWindow {
  public setCard(cardModel: BonusModel) {
    const componentName = this.node.getChildByName("NameBonus");
    const componentDescription = this.node.getChildByName("DescriptionBonus");

    const componentCardPicture = this.node
      .getChildByName("GraphicsCardImage")
      ?.getChildByName("CardPicture");
    const componentCardUseExample = this.node
      .getChildByName("GraphicsCardExaple")
      ?.getChildByName("CardUseExample");

    if (
      !componentName ||
      !componentDescription ||
      !componentCardPicture ||
      !componentCardUseExample
    )
      return;

    const labelName = componentName?.getComponent(Label);
    const labelDescription = componentDescription?.getComponent(Label);
    const CardPicture = componentCardPicture?.getComponent(Sprite);
    const CardUseExample = componentCardUseExample?.getComponent(Sprite);

    if (!labelName || !labelDescription || !CardPicture || !CardUseExample)
      return;

    labelName.string = cardModel.cardName;
    labelDescription.string = cardModel.cardDescription;
    CardPicture.spriteFrame = cardModel.cardImage;
    CardUseExample.spriteFrame = cardModel.cardImageForExample;
  }
}
