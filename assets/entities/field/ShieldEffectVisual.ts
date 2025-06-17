import { _decorator, Color, tween, Sprite, UIOpacity } from 'cc';
import { BaseEffectVisual } from './BaseEffectVisual';
import { VisualEffectPlayer } from './VisualEffectPlayer';

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
        VisualEffectPlayer.instance.flashAndFadeOut(this.node, this.sprite);
    }

}
