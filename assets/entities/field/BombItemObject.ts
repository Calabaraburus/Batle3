import { ItemSubObject } from './ItemSubObject';
import { instantiate, Prefab, Node, UITransform, Vec3 } from 'cc';
import { BombItemVisual } from './BombItemVisual';

/**
 * Конкретный предмет — Бомба.
 */
export class BombItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        this.visualNode = instantiate(this.prefab);
        this.visualNode.name = 'ItemVisual';
        tileNode.addChild(this.visualNode);

        // Масштабируем под тайл
        const tileTransform = tileNode.getComponent(UITransform);
        const itemTransform = this.visualNode.getComponent(UITransform);

        if (tileTransform && itemTransform) {
            const scaleX = (tileTransform.contentSize.width / itemTransform.contentSize.width) * 0.65;
            const scaleY = (tileTransform.contentSize.height / itemTransform.contentSize.height) * 0.75;
            this.visualNode.setScale(new Vec3(scaleX, scaleY, 1));
        }

        this.visualNode.setPosition(new Vec3(0, 0, 0));

        // Установить состояние по умолчанию (например, скрыт или неактивен)
        const visual = this.visualNode.getComponent(BombItemVisual);
        visual?.setActive?.();
    }

    protected onDestroy(): void {
        if (this.visualNode?.isValid) {
            this.visualNode.destroy();
        }
        this.visualNode = null;
    }
}
