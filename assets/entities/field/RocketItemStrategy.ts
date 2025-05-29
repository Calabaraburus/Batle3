import type { ItemStrategy } from './ItemStrategy';
import type { GridCell } from './GridCell';
import { RocketItemObject } from './RocketItemObject';

export class RocketItemStrategy implements ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: RocketItemObject): GridCell[] {
        return allCells.filter(cell => {
            const type = cell.getParameter<number>('type');
            const opened = cell.getParameter<boolean>('opened');
            return type !== -1 && type === item['ownerType'] && !opened;
        });
    }
}