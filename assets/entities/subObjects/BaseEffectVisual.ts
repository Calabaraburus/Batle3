import { _decorator, Component, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Базовый визуальный компонент для эффектов (например, щитов, ловушек и т.п.).
 */
@ccclass('BaseEffectVisual')
export class BaseEffectVisual extends Component {
    @property(Sprite)
    sprite: Sprite | null = null;

    onLoad(): void {
        // Автоматически находит спрайт, если он не установлен вручную
        if (!this.sprite) {
            this.sprite = this.getComponent(Sprite);
        }
    }

    /** Включает визуальный эффект */
    public setActive(): void {
        this.node.active = true;
        if (this.sprite) {
            this.sprite.color = Color.WHITE;
        }
    }

    /** Отключает визуальный эффект */
    public setInactive(): void {
        this.node.active = false;
    }

    /** Устанавливает визуал как "готовый к активации" */
    public setArmed(): void {
        if (this.sprite) {
            this.sprite.color = new Color(180, 255, 255);
        }
    }

    /** Помечает визуал как "предупреждающий" */
    public setWarning(): void {
        if (this.sprite) {
            this.sprite.color = new Color(255, 180, 180);
        }
    }
}
