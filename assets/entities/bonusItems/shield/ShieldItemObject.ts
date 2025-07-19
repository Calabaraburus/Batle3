import { Prefab } from 'cc';
import { ItemSubObject } from '../ItemSubObject';
import { GridCell } from '../../field/GridCell';
import { SubObjectGenerator } from '../../subObjects/SubObjectGenerator';
import { ShieldEffectSubObject } from '../shieldEffect/ShieldEffectSubObject';

export class ShieldItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        this.initVisual();
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }

    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell || !SubObjectGenerator.instance) return false;

        const playerType = this.ownerType;
        const targetType = target.getParameter<number>('type');
        const opened = target.getParameter('opened') === true;

        // Можно активировать только вражескую неоткрытую клетку
        if (targetType === playerType || opened) return false;

        const groupId = ShieldEffectSubObject.createGroupId();

        const currentType = target.getParameter('type'); // ← 'player' или 'enemy'

        const cellsToProtect = [target, ...target.neighbors]
            .filter(c =>
                c.getParameter('type') === currentType &&
                !c.getParameter('opened')
            )
            .slice(0, 4);

        const prefab = SubObjectGenerator.instance.shieldEffectPrefab;
        if (!prefab) {
            console.warn('[ShieldItemObject] ❗ Префаб щита не задан');
            return false;
        }

        SubObjectGenerator.instance.spawnEffect(
            ShieldEffectSubObject,
            prefab,
            cellsToProtect,
            true // ← пусть универсальный метод сам создаст groupId
        );

        this.consume();
        return true;
    }
}
