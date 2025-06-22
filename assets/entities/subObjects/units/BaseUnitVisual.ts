import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Базовый визуальный компонент для юнита.
 * Управляет отображением состояния (жив / мертв) через спрайты.
 */
@ccclass('BaseUnitVisual')
export class BaseUnitVisual extends Component {
    @property({ type: [SpriteFrame] })
    stateSprites: SpriteFrame[] = [];

    /**
     * Установить состояние "жив".
     */
    public setAlive(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[0]) {
            sprite.spriteFrame = this.stateSprites[0];
        }
    }

    /**
     * Установить состояние "мертв".
     */
    public setDead(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[1]) {
            sprite.spriteFrame = this.stateSprites[1];
        }
    }
}
