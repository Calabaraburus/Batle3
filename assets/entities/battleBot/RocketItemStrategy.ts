import { RocketItemObject } from '../bonusItems/rocket/RocketItemObject';
import { GridCell } from '../field/GridCell';
import type { ItemStrategy } from './ItemStrategy';


export class RocketItemStrategy implements ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: RocketItemObject): GridCell[] {
        return allCells.filter(cell => {
            const type = cell.getParameter<number>('type');
            const opened = cell.getParameter<boolean>('opened');
            return type !== -1 && type === item['ownerType'] && !opened;
        });
    }
}