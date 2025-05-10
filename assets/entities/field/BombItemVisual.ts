import { _decorator } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
const { ccclass } = _decorator;

/**
 * Визуал конкретного предмета — бомбы.
 * Можно добавить уникальные эффекты при активации/деактивации.
 */
@ccclass('BombItemVisual')
export class BombItemVisual extends BaseItemVisual {
    public override setActive(): void {
        super.setActive();
        // Здесь можешь добавить эффекты, звук, вспышку и т.п.
        // например: this.node.runAction(вибрация/прыжок)
    }

    public override setInactive(): void {
        super.setInactive();
        // Доп. логика отключения
    }
}
