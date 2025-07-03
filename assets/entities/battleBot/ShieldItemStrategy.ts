import { ShieldItemObject } from '../bonusItems/shield/ShieldItemObject';
import { GridCell } from '../field/GridCell';
import type { ItemStrategy } from './ItemStrategy';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';

export class ShieldItemStrategy implements ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: ShieldItemObject): GridCell[] {
        const myType = item['ownerType'];

        // 🛡️ Ищем ЗАКРЫТЫЕ клетки своей стороны с живыми юнитами
        const targets = allCells.filter(cell =>
            cell.getParameter('type') !== myType &&
            cell.getParameter('opened') !== true &&
            cell.getSubObjects().some(obj => obj instanceof UnitSubObject && obj.isAlive)
        );

        return targets;
    }
}
