import { GridCell } from './GridCell';
import { UnitSubObject } from './UnitSubObject';
import { UnitGroupManager } from './UnitGroupManager';
import { ItemSubObject } from './ItemSubObject';
import { ShieldEffectSubObject } from './ShieldEffectSubObject';
import { VisualEffectPlayer } from './VisualEffectPlayer';

/**
 * Обрабатывает попадание в клетку.
 * Возвращает true, если произошёл эффект мгновенного предмета (например, бомба).
 */
export function processCellHit(
    cell: GridCell,
    openAndRevealCell: (cell: GridCell) => void
): boolean {
    if (!cell) return false;

    VisualEffectPlayer.instance.playExplosion(cell);

    const blocked = ShieldEffectSubObject.tryIntercept(cell);
    if (blocked) return false;

    openAndRevealCell(cell);

    const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
    if (unit && unit.isAlive) {
        unit.markAsDead();
        UnitGroupManager.instance.onUnitDestroyed(unit);
    }

    const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
    if (item && !item.isReadyToUse()) {
        const triggered = item.tryApplyEffectTo(cell);
        return triggered; // true — мгновенный предмет сработал
    }

    return false;
}
