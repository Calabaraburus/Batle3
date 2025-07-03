import { _decorator, tween, Vec3, Sprite, Color, UIOpacity } from 'cc';
import { BaseItemVisual } from '../BaseItemVisual';

const { ccclass } = _decorator;

@ccclass('CaptiveItemVisual')
export class CaptiveItemVisual extends BaseItemVisual {

    /**
     * Анимация спасения: 2 сек тряска, затем смена спрайта, прыжок вверх, затем эффект "салют"
     */
    public playFreeAnimation(onComplete?: () => void): void {
        const node = this.node;
        if (!node || !node.isValid) return;

        const basePos = node.getPosition();
        const baseScale = node.getScale();

        // 1. Тряска
        const shakeDuration = 1;
        const shakeSteps = 20;
        const interval = shakeDuration / shakeSteps;
        const shakeAmount = 3;
        let step = 0;

        const shake = () => {
            if (step >= shakeSteps) {
                this.setSpriteFrame(2); // смена спрайта

                const jumpPos = basePos.clone().add(new Vec3(0, 50, 0));

                tween(node)
                    .to(1, { position: jumpPos }, { easing: 'quadInOut' }) // только прыжок
                    .call(() => {
                        this.playFireworkEffect(onComplete);
                    })
                    .start();
                return;
            }

            const offsetX = (Math.random() - 0.5) * shakeAmount;
            const offsetY = (Math.random() - 0.5) * shakeAmount;
            node.setPosition(basePos.clone().add(new Vec3(offsetX, offsetY, 0)));

            step++;
            setTimeout(shake, interval * 500);
        };

        shake();
    }

    /**
     * Эффект "вспышки" — масштаб + прозрачность
     */
    private playFireworkEffect(onComplete?: () => void): void {
        const node = this.node;
        const scaleUp = node.getScale().clone().multiplyScalar(1.5);

        const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacity.opacity = 255;

        tween(node)
            .parallel(
                tween().to(0.2, { scale: scaleUp }),
                tween().to(0.2, { }, {
                    onUpdate: (_target, ratio?: number) => {
                        if (ratio !== undefined) {
                            opacity.opacity = 255 * (1 - ratio);
                        }
                    }
                })
            )
            .call(() => {
                onComplete?.();
                node.destroy();
            })
            .start();
    }
}
