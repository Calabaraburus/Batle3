import { ItemSubObject } from './ItemSubObject';
import { GridCell } from './GridCell';
import { instantiate, Prefab, UITransform, Vec3 } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
import { HexCell } from './HexCell';

export class RocketItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        this.visualNode = instantiate(this.prefab);
        this.visualNode.name = 'ItemVisual';
        tileNode.addChild(this.visualNode);

        this.scaleToCell();
        this.setVisualHidden();

        // Зафиксируем владельца тайла (для определения противника)
        this.ownerType = this.cell.getParameter<number>('type') || -1;
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }

    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell) return false;

        const isTargetEnemy = target.getParameter('type') === this.ownerType;
        const alreadyOpened = target.getParameter('opened') === true;

        if (!isTargetEnemy || alreadyOpened) return false;

        // 1. Основной удар
        this.markCellAsHit(target);

        // 2. Дополнительный случайный сосед
        const neighbors = target.neighbors.filter(n => n.getParameter('opened') !== true);
        if (neighbors.length > 0) {
            const random = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.markCellAsHit(random);
        }

        // 3. Завершить использование
        this.consume();
        return true;
    }

    private markCellAsHit(cell: GridCell): void {
        cell.addParameter('destroyed', true);
        cell.addParameter('opened', true);

        // Удалим туман
        const fogs = cell.getSubObjects().filter(s => s.constructor.name === 'FogSubObject');
        for (const fog of fogs) cell.detachSubObject(fog);

        // Обновим визуал
        const hex = cell.getVisualNode()?.getComponent(HexCell);
        hex?.markAsOpened(true);
        hex?.markAsBurning();
    }

    private setVisualHidden(): void {
        this.visualNode?.getComponent(BaseItemVisual)?.setHide();
    }
}
