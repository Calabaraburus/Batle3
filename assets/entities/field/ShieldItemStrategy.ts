import type { ItemStrategy } from './ItemStrategy';
import type { GridCell } from './GridCell';
import { ShieldItemObject } from './ShieldItemObject';

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
