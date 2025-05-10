import { GridSubObject } from './GridSubObject';
import { Node } from 'cc';
import { BaseUnitVisual } from './BaseUnitVisual';

export abstract class UnitSubObject extends GridSubObject {
    public visualNode: Node | null = null;
    public isAlive = true;

    /**
     * Убить юнита (сменить визуал через BaseUnitVisual)
     */
    public markAsDead(): void {
        this.isAlive = false;

        if (this.visualNode?.isValid) {
            const visual = this.visualNode.getComponent(BaseUnitVisual);
            visual?.setDead();
        }
    }

    /**
     * Возродить юнита (для повторного использования или анимации)
     */
    public markAsAlive(): void {
        this.isAlive = true;

        if (this.visualNode?.isValid) {
            const visual = this.visualNode.getComponent(BaseUnitVisual);
            visual?.setAlive();
        }
    }
}
