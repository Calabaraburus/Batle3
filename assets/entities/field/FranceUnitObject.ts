import { UnitSubObject } from './UnitSubObject';
import { instantiate, Prefab, Node, UITransform, Vec3, _decorator } from 'cc';
import { BaseUnitVisual } from './BaseUnitVisual';

const { ccclass, property } = _decorator;

/**
 * Конкретный юнит — Француз.
 */
@ccclass('FranceUnitObject')
export class FranceUnitObject extends UnitSubObject {
    @property({ type: Prefab })
    public prefab: Prefab | null = null;

    @property({ tooltip: 'Коэффициент заполнения гекса (0.1 - 1.0)' })
    public scaleRatio = 0.7;

    protected onInit(): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        // Создаём визуальный узел из префаба
        this.visualNode = instantiate(this.prefab);
        this.visualNode.name = 'UnitVisual';
        tileNode.addChild(this.visualNode);

        // Масштабируем под тайл с учётом scaleRatio
        const tileTransform = tileNode.getComponent(UITransform);
        const unitTransform = this.visualNode.getComponent(UITransform);

        if (tileTransform && unitTransform) {
            const scaleX = (tileTransform.contentSize.width / unitTransform.contentSize.width) * this.scaleRatio;
            const scaleY = (tileTransform.contentSize.height / unitTransform.contentSize.height) * this.scaleRatio;
            const uniformScale = Math.min(scaleX, scaleY);
            this.visualNode.setScale(new Vec3(uniformScale, uniformScale, 1));
        }

        // Устанавливаем позицию по центру
        this.visualNode.setPosition(new Vec3(0, 0, 0));

        // Активируем визуал "живой"
        const visual = this.visualNode.getComponent(BaseUnitVisual);
        visual?.setAlive();
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }
}
