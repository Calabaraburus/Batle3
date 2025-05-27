import { _decorator } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
const { ccclass } = _decorator;

/**
 * Визуал конкретного предмета — бомбы.
 * Можно добавить уникальные эффекты при активации/деактивации.
 */
@ccclass('RocketItemVisual')
export class RocketItemVisual extends BaseItemVisual {
    public override setHide(): void {
        super.setHide();
        // Здесь можешь добавить эффекты, звук, вспышку и т.п.
        // например: this.node.runAction(вибрация/прыжок)
    }

    public override setActive(): void {
        super.setActive();
        // Доп. логика отключения
    }
}
