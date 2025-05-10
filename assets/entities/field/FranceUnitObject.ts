import { UnitSubObject } from './UnitSubObject';
import { instantiate, Prefab, Node, UITransform, Vec3 } from 'cc';
import { BaseUnitVisual } from './BaseUnitVisual';

/**
 * Конкретный юнит — Француз.
 */
export class FranceUnitObject extends UnitSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        // Создаём визуальный узел из префаба
        this.visualNode = instantiate(this.prefab);
        this.visualNode.name = 'UnitVisual';
        tileNode.addChild(this.visualNode);

        // Масштабируем под тайл
        // Масштабируем под тайл
        const tileTransform = tileNode.getComponent(UITransform);
        const unitTransform = this.visualNode.getComponent(UITransform);

        if (tileTransform && unitTransform) {
            const scaleX = (tileTransform.contentSize.width / unitTransform.contentSize.width) * 0.7;
            const scaleY = (tileTransform.contentSize.height / unitTransform.contentSize.height) * 0.9;
            this.visualNode.setScale(new Vec3(scaleX, scaleY, 1));
        }

        // Активируем визуал "живой"
        const visual = this.visualNode.getComponent(BaseUnitVisual);
        visual?.setAlive();

        this.visualNode.setPosition(new Vec3(0, 0, 0));
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }
}
