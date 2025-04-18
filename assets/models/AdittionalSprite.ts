import { _decorator, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AdittionalSprite")
export class AdittionalSprite {
  @property({})
  name = "Name";

  @property({ type: SpriteFrame })
  sprite: SpriteFrame = null;
}
