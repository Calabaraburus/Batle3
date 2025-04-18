import { Sprite, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CardStrtLVLWnd')
export class CardStrtLVLWnd {
    @property(Sprite)
    card: Sprite;
    @property(Sprite)
    lvlIco: Sprite;
}
