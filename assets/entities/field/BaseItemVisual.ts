import { _decorator, Component, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseItemVisual')
export class BaseItemVisual extends Component {
    @property({ type: [SpriteFrame] })
    stateSprites: SpriteFrame[] = [];

    private pulseTween: Tween | null = null;

    public setHide(): void {
        this.stopPulse();
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[0]) {
            sprite.spriteFrame = this.stateSprites[0];
        }
    }

    public setActive(): void {
        this.stopPulse();
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[1]) {
            sprite.spriteFrame = this.stateSprites[1];
        }
    }

    public setArmed(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[2]) {
            sprite.spriteFrame = this.stateSprites[2];
        }

        this.startPulse();
    }

    private startPulse(): void {
        this.stopPulse();

        const baseScale = this.node.getScale(); // 🟢 сохраняем исходный масштаб
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

    private stopPulse(): void {
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
    }
}
