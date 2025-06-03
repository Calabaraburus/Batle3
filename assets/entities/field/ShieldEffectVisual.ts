import { _decorator, Color, tween, Sprite, UIOpacity } from 'cc';
import { BaseEffectVisual } from './BaseEffectVisual';

const { ccclass } = _decorator;

@ccclass('ShieldEffectVisual')
export class ShieldEffectVisual extends BaseEffectVisual {
    private blinkTween: any = null;

    public applyEffect(): void {
        if (!this.sprite) return;

        this.sprite.color = new Color(150, 255, 150, 180); // зелёный полупрозрачный

        // Остановим предыдущее мигание
        if (this.blinkTween) {
            this.blinkTween.stop();
        }

        this.blinkTween = tween(this.sprite)
            .repeatForever(
                tween()
                    .to(0.6, { color: new Color(150, 255, 150, 100) })
                    .to(0.6, { color: new Color(150, 255, 150, 180) })
            )
            .start();
    }

    public removeEffect(): void {
        if (!this.sprite) return;

        if (this.blinkTween) {
            this.blinkTween.stop();
            this.blinkTween = null;
        }

        this.sprite.color = new Color(255, 255, 255, 255); // белый
    }

    public fadeOutAndDestroy(duration = 0.5): void {
        if (!this.sprite || !this.node) return;

        // Остановить мигание
        if (this.blinkTween) {
            this.blinkTween.stop();
            this.blinkTween = null;
        }

        // Добавим компонент прозрачности, если ещё не добавлен
        const opacityComp = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);

        // ✨ Эффект вспышки: временно сделаем белый цвет
        const originalColor = this.sprite.color.clone();
        this.sprite.color = new Color(255, 255, 255, 255);

        // Сначала быстро вспышка, затем затухание
        tween(this.sprite)
            .to(0.1, { color: originalColor }) // вернём цвет обратно
            .start();

        tween(opacityComp)
            .delay(0.1)
            .to(duration, { opacity: 0 }) // затухание
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

}
