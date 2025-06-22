import { _decorator, Color, Tween, tween, Vec3, Sprite } from 'cc';
import { BaseItemVisual } from '../BaseItemVisual';
const { ccclass } = _decorator;

/**
 * Визуал предмета "Щит".
 * Управляет спрайтом и визуальными эффектами: появление, пульсация при готовности и деактивация.
 */
@ccclass('ShieldItemVisual')
export class ShieldItemVisual extends BaseItemVisual {
    /**
     * Скрытое состояние (до открытия).
     */
    public override setHide(): void {
        super.setHide();
        this.setShieldColor(new Color(180, 180, 255, 180)); // нежно-синий
    }

    /**
     * Состояние после активации, но до выбора клетки.
     */
    public override setActive(): void {
        super.setActive();
        this.setShieldColor(new Color(120, 200, 255, 200));
    }

    /**
     * Состояние готовности к применению (пульсация).
     */
    public override setArmed(): void {
        super.setArmed();
        this.setShieldColor(new Color(100, 255, 255, 255));
    }

    /**
     * Установка цвета щита (по желанию).
     */
    private setShieldColor(color: Color): void {
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.color = color;
        }
    }
}
