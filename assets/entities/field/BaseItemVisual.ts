import { _decorator, Component, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { GridCell } from './GridCell';
const { ccclass, property } = _decorator;

/**
 * Универсальный визуальный компонент предмета.
 * Позволяет управлять визуальным состоянием: скрыт, активен, готов к действию (пульсирует).
 */
@ccclass('BaseItemVisual')
export class BaseItemVisual extends Component {
    @property({ type: [SpriteFrame] })
    stateSprites: SpriteFrame[] = [];

    private pulseTween: Tween | null = null;

    /** Устанавливает спрайт "спрятан" (обычно перед активацией) */
    public setHide(): void {
        this.stopPulse();
        this.setSpriteFrame(0);
    }

    /** Устанавливает спрайт "активен" (после открытия, но до использования) */
    public setActive(): void {
        this.stopPulse();
        this.setSpriteFrame(1);
    }

    /** Устанавливает спрайт "заряжен" (готов к действию) + анимация пульсации */
    public setArmed(): void {
        this.setSpriteFrame(2);
        this.startPulse();
    }

    /** Приватно: применяет нужный спрайт по индексу, если есть */
    private setSpriteFrame(index: number): void {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[index]) {
            sprite.spriteFrame = this.stateSprites[index];
        }
    }

    /** анимация полета (например для кражи) */
    public playStealAnimation(fromCell: GridCell, toCell: GridCell, baseScale: Vec3): void {
        const node = this.node;
        if (!node || !node.isValid) return;

        const fromWorld = fromCell.getVisualNode()?.getWorldPosition();
        const toWorld = toCell.getVisualNode()?.getWorldPosition();
        if (!fromWorld || !toWorld) return;

        node.setWorldPosition(fromWorld);
        node.setScale(baseScale);
        node.active = true;

        const scaleUp = new Vec3(baseScale.x * 1.1, baseScale.y * 1.1, baseScale.z);

        tween(node)
            .to(0.5, { worldPosition: toWorld }, { easing: 'quadInOut' }) // перелёт
            .call(() => {
                // pop-эффект
                tween(node)
                    .to(0.15, { scale: scaleUp })
                    .to(0.15, { scale: baseScale })
                    .delay(0.2) // пауза перед удалением
                    .call(() => {
                        node.destroy(); // удаляем визуал
                    })
                    .start();
            })
            .start();
    }

    /** Запускает анимацию пульсации вокруг базового масштаба */
    private startPulse(): void {
        this.stopPulse(); // Сбросить, если уже был активен

        const baseScale = this.node.getScale();
        const scaleUp = new Vec3(baseScale.x * 1.1, baseScale.y * 1.1, baseScale.z);
        const scaleDown = baseScale.clone();

        this.pulseTween = tween(this.node)
            .repeatForever(
                tween()
                    .to(0.4, { scale: scaleUp })
                    .to(0.4, { scale: scaleDown })
            )
            .start();
    }

    /** Останавливает пульсацию и сбрасывает ссылку */
    private stopPulse(): void {
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
    }
}
