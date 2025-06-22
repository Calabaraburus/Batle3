import { ShieldItemObject } from '../bonusItems/shield/ShieldItemObject';
import { GridCell } from '../field/GridCell';
import type { ItemStrategy } from './ItemStrategy';


export class ShieldItemStrategy implements ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: ShieldItemObject): GridCell[] {
        const activatorType = item['ownerType'] === 1 ? 2 : 1;

        // Бот хочет поставить щит на свои (открытые) клетки, находясь на вражеской стороне
        return allCells.filter(cell => {
            const type = cell.getParameter<number>('type');
            const opened = cell.getParameter<boolean>('opened');
            return type === activatorType && !opened;
        });
    }
}
