import { Node } from 'cc';
import { BaseUnitVisual } from './BaseUnitVisual';
import { GridSubObject } from '../GridSubObject';
import { UnitGroupManager } from '../../battle/UnitGroupManager';
import { HexCell } from '../../field/HexCell';


/**
 * Базовый класс боевого юнита, может быть частью группы.
 */
export abstract class UnitSubObject extends GridSubObject {
    public visualNode: Node | null = null;
    public isAlive = true;

    /**
     * Идентификатор группы, к которой принадлежит юнит
     */
    public groupId = '';

    /**
     * Убить юнита (сменить визуал через BaseUnitVisual)
     */
    public markAsDead(): void {
        this.isAlive = false;

        if (this.visualNode?.isValid) {
            const visual = this.visualNode.getComponent(BaseUnitVisual);
            visual?.setDead();
        }

        UnitGroupManager.instance.onUnitDestroyed(this);
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

    public updateHighlight(): void {
        if (this.cell?.getParameter('type') === 1) {
            const hex = this.cell.getVisualNode()?.getComponent(HexCell);
            hex?.markAsFriendly();
        }
    }

} 
