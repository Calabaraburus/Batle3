import {
  _decorator,
  Component,
  Node,
  director,
  tween,
  find,
  SpriteFrame,
  Sprite,
  Vec3,
  UIOpacity,
} from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { LevelSelectorController } from "../level/LevelSelectorController";
const { ccclass, property } = _decorator;

@ccclass("PreviewWindow")
export class PreviewWindow extends Component {
  private level: LevelSelectorController;
  start() {
    const playerHero = find(
      "LevelConfiguration/HeroModels/HeroPlayer"
    )?.getComponent(PlayerModel);

    if (playerHero?.bonuses.length != 0) {
      this.show();
    }
  }

  get _overlay() {
    return find("Overlay", this.node);
  }

  get _playerBack() {
    return this.node.getChildByName("PlayerBack");
  }

  get _botBack() {
    return this.node.getChildByName("BotBack");
  }

  getCard(item: number) {
    const playerHero = find(
      "LevelConfiguration/HeroModels/HeroPlayer"
    )?.getComponent(PlayerModel);
    const botHero = find("LevelConfiguration/HeroModels/HeroBot")?.getComponent(
      PlayerModel
    );

    return [
      botHero?.bonuses[item].cardImage,
      playerHero?.bonuses[item].cardImage,
    ];
  }

  show() {
    if (!this._overlay || !this._playerBack || !this._botBack) return;
    this._overlay.active = true;
    this._playerBack.active = true;
    this._botBack.active = true;

    tween(this._overlay.getComponent(UIOpacity))
      .delay(5)
      .to(0.5, { opacity: 0 }, { easing: "linear" })
      .call(() => {
        if (this._overlay) {
          this._overlay.active = false;
        }
      })
      .start();

    tween(this._playerBack.getChildByPath("Cards/GraphicsCardOne/BonusCard"))
      .delay(1)
      .to(0.8, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: "elasticIn" })
      .call(() => {
        const spriteCardPlayer = this.getCard(0)[1];
        if (spriteCardPlayer == undefined) return;

        const spritePlayer = this.node
          .getChildByPath("PlayerBack/Cards/GraphicsCardOne/BonusCard")
          ?.getComponent(Sprite);

        if (!spritePlayer) return;
        spritePlayer.spriteFrame = spriteCardPlayer;
      })
      .start();

    tween(this._playerBack.getChildByPath("Cards/GraphicsCardTwo/BonusCard"))
      .delay(2)
      .to(0.8, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: "elasticIn" })
      .call(() => {
        const spriteCardPlayer = this.getCard(1)[1];
        if (spriteCardPlayer == undefined) return;

        const spritePlayer = this.node
          .getChildByPath("PlayerBack/Cards/GraphicsCardTwo/BonusCard")
          ?.getComponent(Sprite);

        if (!spritePlayer) return;
        spritePlayer.spriteFrame = spriteCardPlayer;
      })
      .start();

    tween(this._playerBack.getChildByPath("Cards/GraphicsCardThree/BonusCard"))
      .delay(3)
      .to(0.8, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: "elasticIn" })
      .call(() => {
        const spriteCardPlayer = this.getCard(2)[1];
        if (spriteCardPlayer == undefined) return;

        const spritePlayer = this.node
          .getChildByPath("PlayerBack/Cards/GraphicsCardThree/BonusCard")
          ?.getComponent(Sprite);

        if (!spritePlayer) return;
        spritePlayer.spriteFrame = spriteCardPlayer;
      })
      .start();

    tween(this._botBack.getChildByPath("Cards/GraphicsCardOne/BonusCard"))
      .delay(1)
      .to(0.8, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: "elasticIn" })
      .call(() => {
        const spriteCardBot = this.getCard(0)[0];
        if (spriteCardBot == undefined) return;

        const spriteBot = this.node
          .getChildByPath("BotBack/Cards/GraphicsCardOne/BonusCard")
          ?.getComponent(Sprite);

        if (!spriteBot) return;
        spriteBot.spriteFrame = spriteCardBot;
      })
      .start();

    tween(this._botBack.getChildByPath("Cards/GraphicsCardTwo/BonusCard"))
      .delay(2)
      .to(0.8, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: "elasticIn" })
      .call(() => {
        const spriteCardBot = this.getCard(1)[0];
        if (spriteCardBot == undefined) return;

        const spriteBot = this.node
          .getChildByPath("BotBack/Cards/GraphicsCardTwo/BonusCard")
          ?.getComponent(Sprite);

        if (!spriteBot) return;
        spriteBot.spriteFrame = spriteCardBot;
      })
      .start();

    tween(this._botBack.getChildByPath("Cards/GraphicsCardThree/BonusCard"))
      .delay(3)
      .to(0.8, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: "elasticIn" })
      .call(() => {
        const spriteCardBot = this.getCard(2)[0];
        if (spriteCardBot == undefined) return;

        const spriteBot = this.node
          .getChildByPath("BotBack/Cards/GraphicsCardThree/BonusCard")
          ?.getComponent(Sprite);

        if (!spriteBot) return;
        spriteBot.spriteFrame = spriteCardBot;
      })
      .start();

    tween(this._playerBack)
      .delay(5)
      .to(0.8, { position: new Vec3(0, -1800, 0) }, { easing: "quadOut" })
      .call(() => {
        this.node.active = false;
      })
      .start();

    tween(this._botBack)
      .delay(5)
      .to(0.8, { position: new Vec3(0, 1800, 0) }, { easing: "quadOut" })
      .call(() => {
        this.node.active = false;
      })
      .start();
  }
}
