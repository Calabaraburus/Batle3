import { GridSubObject } from './GridSubObject';
import type { Node } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';

export abstract class ItemSubObject extends GridSubObject {
    public visualNode: Node | null = null;

    /**
     * Активация предмета на клетке (если есть визуал)
     */
    public activate(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive?.(); // если определено
    }

    /**
     * Деактивация предмета или его визуального состояния
     */
    public deactivate(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setInactive?.();
    }

    protected abstract onInit(): void;
    protected abstract onDestroy(): void;
}
