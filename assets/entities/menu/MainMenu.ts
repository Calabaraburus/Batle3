import {
  _decorator,
  Component,
  Node,
  UIOpacity,
  tween,
  Vec2,
  Vec3,
  Sprite,
  SpriteFrame,
} from "cc";
import { Service } from "../services/Service";
const { ccclass, property } = _decorator;

@ccclass("MainMenu")
export class MainMenu extends Service {
  @property(SpriteFrame)
  backGround: SpriteFrame;

  start() {
    this.init();
  }

  init() {
    const back = this.node.getChildByName("back")?.getComponent(Sprite);
    if (!back) return;
    back.spriteFrame = this.backGround;
  }

  showWindow() {
    this.node.active = true;

    // this.node.scale = this.initScale;

    // tween(this.node)
    //   .to(0.2, { scale: this.finaleScale }, { easing: "backOut" })
    //   .start();
  }

  hideWindow() {
    // tween(this.node)
    //   .to(0.2, { scale: this.initScale }, { easing: "quadInOut" })
    //   .call(() => {
    //     this.node.active = false;
    //   })
    //   .start();
    this.node.active = false;
  }

  closeButton() {
    return;
  }
}
