import { _decorator, Component, Node, Prefab, Animation, instantiate, UITransform, Vec3, UIOpacity, tween, Color, Sprite } from 'cc';
import { GridCell } from '../field/GridCell';
import { wait } from '../battle/TimeUtils';

const { ccclass, property } = _decorator;

@ccclass('VisualEffectPlayer')
export class VisualEffectPlayer extends Component {
    public static instance: VisualEffectPlayer;

    @property({ type: Prefab })
    public explosionEffectPrefab: Prefab | null = null;

    // Текущие активные анимации по ключам
    private activeEffects: Set<string> = new Set();

    onLoad() {
        VisualEffectPlayer.instance = this;
    }

    /**
     * Запускает отслеживаемый эффект (по уникальному ключу)
     */
    private beginBlock(key: string): void {
        this.activeEffects.add(key);
    }

    /**
     * Завершает отслеживаемый эффект
     */
    private endBlock(key: string): void {
        this.activeEffects.delete(key);
    }

    /**
     * Ожидает завершения всех отслеживаемых эффектов
     */
    public async waitForAllEffects(): Promise<void> {
        while (this.activeEffects.size > 0) {
            await wait(100);
        }
    }

    /**
     * Проигрывает анимацию взрыва на указанной клетке.
     * Масштабируется под размер тайла.
     */
    async playExplosion(cell: GridCell, scaleFactor = 0.3): Promise<void> {
        if (!this.explosionEffectPrefab) return;

        const visualNode = cell.getVisualNode();
        if (!visualNode || !visualNode.isValid) return;

        const key = `explosion-${Math.random()}`; // Уникальный ID
        this.beginBlock(key);

        const explosion = instantiate(this.explosionEffectPrefab);
        explosion.setPosition(new Vec3(0, 0, 0));
        visualNode.addChild(explosion);

        const target = visualNode.getComponent(UITransform);
        const effect = explosion.getComponent(UITransform);
        if (target && effect) {
            const scaleX = (target.contentSize.x / effect.contentSize.x) * scaleFactor;
            const scaleY = (target.contentSize.y / effect.contentSize.y) * scaleFactor;
            const uniform = Math.min(scaleX, scaleY);
            explosion.setScale(uniform, uniform, 1);
        }

        explosion.getComponent(Animation)?.play();

        await wait(600);
        if (explosion?.isValid) explosion.destroy();

        await wait(400); // Остаточная задержка
        this.endBlock(key);
    }

    /**
     * Вспышка и затухание спрайта с последующим уничтожением
     */
    async flashAndFadeOut(node: Node, sprite: Sprite, duration = 0.5): Promise<void> {
        if (!node || !sprite) return;

        const key = `fade-${Math.random()}`;
        this.beginBlock(key);

        const opacityComp = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);

        const originalColor = sprite.color.clone();
        sprite.color = new Color(255, 255, 255, 255);

        tween(sprite)
            .to(0.1, { color: originalColor })
            .start();

        tween(opacityComp)
            .delay(0.1)
            .to(duration, { opacity: 0 })
            .call(() => {
                if (node?.isValid) node.destroy();
                this.endBlock(key);
            })
            .start();

        await wait(duration * 1000 + 200);
    }
}
