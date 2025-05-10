import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Базовый визуальный компонент для предметов.
 * Позволяет переключать состояние (активен / неактивен) через спрайты.
 */
@ccclass('BaseItemVisual')
export class BaseItemVisual extends Component {
    @property({ type: [SpriteFrame] })
    stateSprites: SpriteFrame[] = [];

    /**
     * Установить визуал как активный (например, бомба готова к действию).
     */
    public setActive(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[0]) {
            sprite.spriteFrame = this.stateSprites[0];
        }
    }

    /**
     * Установить визуал как неактивный (например, бомба обезврежена).
     */
    public setInactive(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[1]) {
            sprite.spriteFrame = this.stateSprites[1];
        }
    }
}
