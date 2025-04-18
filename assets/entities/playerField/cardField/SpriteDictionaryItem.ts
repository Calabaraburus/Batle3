import { CCString, Sprite, SpriteFrame, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SpriteDictionaryItem")
export class SpriteDictionaryItem {
    @property({ type: CCString })
    key: string;

    @property({ type: SpriteFrame })
    sprite: SpriteFrame;
}
