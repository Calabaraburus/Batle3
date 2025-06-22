import { instantiate, Prefab } from 'cc';
import { ItemSubObject } from '../ItemSubObject';
import { GridCell } from '../../field/GridCell';
import { SubObjectGenerator } from '../../subObjects/SubObjectGenerator';
import { ShieldEffectSubObject } from '../shieldEffect/ShieldEffectSubObject';


export class ShieldItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;
    private static nextGroupId = 1;

    protected onInit(): void {
        this.initVisual();
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }

    /** Применяет эффект — создаёт ShieldEffectSubObject на клетке и соседях */
    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell || !SubObjectGenerator.instance) return false;

        const isTargetEnemy = target.getParameter('type') !== this.ownerType;
        const alreadyOpened = target.getParameter('opened') === true;

        if (!isTargetEnemy || alreadyOpened) return false;

        const groupId = ShieldEffectSubObject.createGroupId();

        const itemCellType = this.cell?.getParameter<number>('type'); // тип клетки с предметом
        const activatorType = itemCellType === 1 ? 2 : 1;              // тот, кто применяет
        const targetType = activatorType;                             // мы хотим защитить его клетки

        const cellsToProtect = [target, ...target.neighbors]
            .filter(c =>
                c.getParameter('type') === targetType &&   // клетки активирующего игрока
                c.getParameter('opened') !== true
            )
            .slice(0, 4);

        const prefab = SubObjectGenerator.instance.shieldEffectPrefab;
        if (!prefab) {
            console.warn('[ShieldItemObject] Префаб щита не задан');
            return false;
        }
        
        SubObjectGenerator.instance.spawnEffect(
            ShieldEffectSubObject,
            groupId,
            cellsToProtect,
            prefab
        );

        this.consume();
        return true;
    }

}
