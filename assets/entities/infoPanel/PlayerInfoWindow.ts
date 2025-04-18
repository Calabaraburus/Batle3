import { BonusModel } from "../../models/BonusModel";
import { PlayerModel } from "../../models/PlayerModel";
import { CardInfoService } from "./CardInfoService";
import { PopupWindow } from "./PopupWindow";
import {
  Graphics,
  Label,
  Sprite,
  SpriteFrame,
  _decorator,
  Node,
  Button,
  EventHandler,
  Prefab,
  instantiate,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerInfoWindow")
export class PlayerInfoWindow extends PopupWindow {
  @property(Prefab)
  cardPrefab: Prefab;

  public setPlayer(playerModel: PlayerModel) {
    const playerName = playerModel.playerName;
    const heroImage = playerModel.heroImage;
    const bonuses = playerModel.bonuses;
    const cardBlock = this.node.getChildByPath("Cards");

    if (cardBlock?.children.length != 0) return;

    const componentName = this.node
      .getChildByName("NamePlayer")
      ?.getComponent(Label);
    if (!componentName) return;
    componentName.string = playerName;

    const componentHeroImage = this.node
      .getChildByPath("GraphicsHeroImage/HeroImage")
      ?.getComponent(Sprite);
    if (!componentHeroImage) return;
    componentHeroImage.spriteFrame = heroImage;

    //bonuses
    bonuses.forEach((bonus) => {
      const card = instantiate(this.cardPrefab);
      card.parent = cardBlock;
      card.getComponent(CardInfoService)?.setModel(bonus);

      const cardSprite = card
        .getChildByName("spriteFrame")
        ?.getComponent(Sprite);
      if (!cardSprite) return;
      cardSprite.spriteFrame = bonus.cardImage;
    });
  }
}
