import { Prefab, UITransform, Vec3, Node } from 'cc';
import { GridSubObject } from './GridSubObject';

export abstract class EffectSubObject extends GridSubObject {
    protected visualPrefab: Prefab | null = null;
    protected visual: Node | null = null; // убедитесь, что это импортированный Node из 'cc'

    public abstract onApply(): void;
    public abstract onRemove(): void;

    public consume(): void {
        console.log('[ShieldEffect] consume →', this.constructor.name, this.cell?.getParameter('x'), this.cell?.getParameter('y'));
        this.onRemove();
        if (this.cell) {
            this.cell.detachSubObject(this);
        }
    }

    public setVisualPrefab(prefab: Prefab): void {
        this.visualPrefab = prefab;
    }

    public setVisualNode(node: Node): void {
        this.visual = node;
    }

    public assignPrefab(prefab: Prefab): void {
        this.visualPrefab = prefab;
    }

    protected scaleToCell(): void {
        if (!this.cell || !this.visual) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        const tileTransform = tileNode.getComponent(UITransform);
        const effectTransform = this.visual.getComponent(UITransform);
        if (!tileTransform || !effectTransform) return;

        const scaleX = tileTransform.contentSize.width / effectTransform.contentSize.width * 0.85;
        const scaleY = tileTransform.contentSize.height / effectTransform.contentSize.height * 0.85;
        const uniformScale = Math.min(scaleX, scaleY);

        this.visual.setScale(new Vec3(uniformScale, uniformScale, 1));
    }
}
