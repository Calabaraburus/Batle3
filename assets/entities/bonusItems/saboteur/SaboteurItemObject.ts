import { ItemSubObject } from '../../field/ItemSubObject';
import { GridCell } from '../../field/GridCell';
import { instantiate, Prefab, tween, Vec3 } from 'cc';
import { SaboteurItemVisual } from './SaboteurItemVisual';
import { BaseItemVisual } from '../../field/BaseItemVisual';

export class SaboteurItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    constructor() {
        super();
        this.stealable = false; // диверсанта самого красть нельзя
    }

    protected onInit(): void {
        this.initVisual();
    }

    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell || !target) {
            this.resetState();
            return false;
        }

        const isOpened = target.getParameter('opened') === true;
        const targetType = target.getParameter('type');
        const isEnemy = targetType !== this.ownerType;

        if (!isOpened || !targetType || targetType === 0 || !isEnemy) {
            this.resetState();
            return false;
        }

        const enemyItems = target.getSubObjects().filter(obj => obj instanceof ItemSubObject) as ItemSubObject[];
        const targetItem = enemyItems.find(item => item.stealable && !item.isReadyToUse());
        if (!targetItem || !targetItem.prefab) {
            this.resetState();
            return false;
        }

        const currentCellItems = this.cell.getSubObjects().filter(obj => obj instanceof ItemSubObject);
        const isFree = currentCellItems.length === 1 && currentCellItems[0] === this;
        if (!isFree) {
            this.resetState();
            return false;
        }

        const fromNode = target.getVisualNode();
        const toNode = this.cell.getVisualNode();
        if (!fromNode || !toNode) {
            this.resetState();
            return false;
        }

        // 📌 Скрываем оригинальный визуал
        if (targetItem.visualNode?.isValid) {
            targetItem.visualNode.active = false;
        }

        // 📌 Создаём копию визуала для анимации
        const ghostNode = instantiate(targetItem.prefab);
        ghostNode.name = 'GhostVisual';
        fromNode.parent?.addChild(ghostNode);
        ghostNode.setScale(targetItem.visualScale);
        ghostNode.setWorldPosition(fromNode.getWorldPosition());
        ghostNode.active = true;

        const ghostVisual = ghostNode.getComponent(BaseItemVisual);
        ghostVisual?.playStealAnimation(target, this.cell, targetItem.visualScale);

        // 📌 Запускаем tween-delay для завершения кражи через 0.95 сек
        tween(ghostNode)
            .delay(0.95)
            .call(() => {
                ghostNode.destroy(); // 🗑 Удалить временный визуал

                // ✅ Перенос предмета
                target.detachSubObject(targetItem);
                targetItem.setOwner(this.ownerType);
                this.cell?.addParameter('wasStolen', true);
                this.cell?.attachSubObject(targetItem);

                // ✅ Удалить диверсанта
                this.consume();
            })
            .start();

        return true;
    }

    protected setVisualHidden(): void {
        this.visualNode?.getComponent(SaboteurItemVisual)?.setHide();
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }
}
