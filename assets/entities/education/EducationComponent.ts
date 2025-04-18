import {
  _decorator,
  assert,
  BlockInputEvents,
  Color,
  color,
  Component,
  Label,
  Node,
  tween,
  UIOpacity,
} from "cc";
import { Service } from "../services/Service";
import { CardService } from "../services/CardService";
import { BonusModel } from "../../models/BonusModel";
const { ccclass, property } = _decorator;

@ccclass("EducationComponent")
export class EducationComponent extends Service {
  @property(Node)
  enemyField: Node;

  @property(Node)
  playerField: Node;

  @property(Node)
  cardSlide: Node;

  @property(Node)
  attackSlide: Node;

  @property(Node)
  cardMessage: Node;

  @property(Node)
  finalSlide: Node;

  @property(Node)
  startBlock: Node;

  @property(Node)
  attackBlock: Node;

  @property(Node)
  cardBlock: Node;

  @property(Node)
  cardUseBlock: Node;

  pOpacity: UIOpacity | null;
  eOpacity: UIOpacity | null;

  cardService: CardService;

  delayBetweenSlides = 0.6;
  slideNumber = 0;
  cardFlag = false;
  bonus: BonusModel | undefined;

  start() {
    const cService = this.getService(CardService);
    assert(cService != null, "Can not find CardService");
    this.cardService = cService;

    this.bonus = this.cardService.getCurrentPlayerModel()?.bonuses.find((b) => {
      return b.mnemonic == "firewallLow";
    });

    this.pOpacity = this.playerField.getComponent(UIOpacity);
    this.eOpacity = this.enemyField.getComponent(UIOpacity);
    const back = this.node.getChildByName("Bkground");
    assert(back != null, "BackGround node is not find");

    this.activateFields();

    this.startBlock.on(Node.EventType.MOUSE_DOWN, this.choiceSlide, this);

    const trigerAttack = this.attackSlide.getChildByName("AttackFrame");
    if (trigerAttack) {
      trigerAttack.on(Node.EventType.MOUSE_DOWN, this.choiceSlide, this);
    }

    // const cardField = this.cardSlide.getChildByName("CardField");
    // if (!cardField) return;
    // cardField.on(Node.EventType.MOUSE_DOWN, this.activateCardFlag, this);

    const targetEnemyField = this.cardSlide.getChildByName("EnemyField");
    if (!targetEnemyField) return;
    targetEnemyField.on(Node.EventType.MOUSE_DOWN, this.choiceSlide, this);
  }

  update() {
    if (this.bonus?.alreadyUsedOnTurn) {
      this.changeMessage();
      this.slideNumber = 2;
    }

    if (this.bonus?.selected) {
      // const fieldBlock = this.cardSlide.getChildByName("block");
      // if (fieldBlock) fieldBlock.active = false;

      // const fieldBlock = this.cardSlide.getChildByName("Block");
      // if (fieldBlock) fieldBlock.active = false;

      const cardFrame = this.cardSlide.getChildByName("CardField");
      if (cardFrame) cardFrame.active = false;

      const pointer = this.cardSlide.getChildByName("Pointer");
      if (pointer) pointer.active = false;

      this.cardBlock.active = false;
      this.cardUseBlock.active = true;
    }
  }

  changeMessage() {
    const textMessage = this.cardSlide
      .getChildByPath("MessageField/MessageCardUse")
      ?.getComponent(Label);

    if (!textMessage) return;
    textMessage.string = "Now you can collapse enemy\ntiles and end your turn.";
    textMessage.color = new Color(250, 0, 0);
  }

  activateFields() {
    tween(this.eOpacity).to(1.5, { opacity: 255 }).start();
    tween(this.pOpacity).to(1.5, { opacity: 255 }).start();
  }

  activateAttackSlide() {
    tween(this.eOpacity)
      .to(0.6, { opacity: 0 })
      .call(() => (this.enemyField.active = false))
      .start();
    tween(this.pOpacity)
      .to(0.6, { opacity: 0 })
      .call(() => (this.playerField.active = false))
      .start();

    this.startBlock.active = false;
    this.attackBlock.active = true;
    this.attackSlide.active = true;

    tween(this.attackSlide.getComponent(UIOpacity))
      .delay(this.delayBetweenSlides)
      .to(0.6, { opacity: 255 })
      .start();

    this.slideNumber = 1;
  }

  activateCardSlide() {
    tween(this.attackSlide.getComponent(UIOpacity))
      .to(0.6, { opacity: 0 })
      .delay(0.6)
      .call(() => (this.attackSlide.active = false))
      .start();

    this.attackBlock.active = false;
    this.cardBlock.active = true;
    this.cardSlide.active = true;

    tween(this.cardSlide.getComponent(UIOpacity))
      .delay(this.delayBetweenSlides)
      .to(0.6, { opacity: 255 })
      .start();
  }

  activateCardMessage() {
    tween(this.cardSlide.getComponent(UIOpacity))
      .to(0.6, { opacity: 0 })
      .delay(0.6)
      .call(() => (this.cardSlide.active = false))
      .start();

    this.cardUseBlock.active = false;
    this.startBlock.active = true;
    this.cardMessage.active = true;

    tween(this.cardMessage.getComponent(UIOpacity))
      .delay(this.delayBetweenSlides)
      .to(0.6, { opacity: 255 })
      .start();
  }

  activateFinalMessage() {
    tween(this.cardMessage.getComponent(UIOpacity))
      .to(0.6, { opacity: 0 })
      .delay(0.6)
      .call(() => (this.cardMessage.active = false))
      .start();

    this.finalSlide.active = true;

    tween(this.finalSlide.getComponent(UIOpacity))
      .delay(this.delayBetweenSlides)
      .to(0.6, { opacity: 255 })
      .start();
  }

  closeEducationBlock() {
    tween(this.finalSlide.getComponent(UIOpacity))
      .to(0.6, { opacity: 0 })
      .delay(0.6)
      .call(() => (this.node.active = false))
      .start();
  }

  activateCardFlag() {
    this.cardFlag = true;
  }

  choiceSlide() {
    switch (this.slideNumber) {
      case 0:
        this.activateAttackSlide();
        break;
      case 1:
        this.activateCardSlide();
        break;
      case 2:
        this.activateCardMessage();
        break;
    }
  }
}
