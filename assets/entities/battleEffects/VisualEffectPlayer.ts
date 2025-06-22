import { _decorator, Component, Node, Prefab, Animation, instantiate, UITransform, Vec3, UIOpacity, tween, Color, Sprite } from 'cc';
import { GridCell } from '../field/GridCell';
import { wait } from '../battle/TimeUtils';


const { ccclass, property } = _decorator;

@ccclass('VisualEffectPlayer')
export class VisualEffectPlayer extends Component {
    public static instance: VisualEffectPlayer;

    @property({ type: Prefab })
    public explosionEffectPrefab: Prefab | null = null;

    onLoad() {
        VisualEffectPlayer.instance = this;
    }

    /**
     * Проигрывает анимацию взрыва на указанной клетке.
     * Масштабируется под размер тайла.
     */
    async playExplosion(cell: GridCell, scaleFactor = 0.3): Promise<void> {
        if (!this.explosionEffectPrefab) return;

        const visualNode = cell.getVisualNode();
        if (!visualNode) return;

        const explosion = instantiate(this.explosionEffectPrefab);
        explosion.setPosition(new Vec3(0, 0, 0));
        visualNode.addChild(explosion);

        // Масштабируем под размер клетки
        const target = visualNode.getComponent(UITransform);
        const effect = explosion.getComponent(UITransform);
        if (target && effect) {
            const scaleX = (target.contentSize.x / effect.contentSize.x) * scaleFactor;
            const scaleY = (target.contentSize.y / effect.contentSize.y) * scaleFactor;
            const uniform = Math.min(scaleX, scaleY);
            explosion.setScale(uniform, uniform, 1);
        }

        explosion.getComponent(Animation)?.play();
        setTimeout(() => explosion.destroy(), 600);

        await wait(1000);

    }

    /**
     * Вспышка и затухание спрайта с последующим уничтожением
     */
    async flashAndFadeOut(node: Node, sprite: Sprite, duration = 0.5): Promise<void> {
        if (!node || !sprite) return;

        // Добавим прозрачность
        const opacityComp = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);

        // Вспышка (белый), затем возвращение цвета
        const originalColor = sprite.color.clone();
        sprite.color = new Color(255, 255, 255, 255);

        tween(sprite)
            .to(0.1, { color: originalColor })
            .start();

        tween(opacityComp)
            .delay(0.1)
            .to(duration, { opacity: 0 })
            .call(() => node.destroy())
            .start();

        await wait(1000);
    }
}
