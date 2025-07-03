import { ItemSubObject } from "../bonusItems/ItemSubObject";
import { SaboteurItemObject } from "../bonusItems/saboteur/SaboteurItemObject";
import { GridCell } from "../field/GridCell";
import { ItemStrategy } from "./ItemStrategy";


export class SaboteurItemStrategy implements ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: SaboteurItemObject): GridCell[] {
        const enemyType = item['ownerType'] === 1 ? 2 : 1;

        // 🔍 Ищем открытые вражеские клетки с крадемыми предметами
        const targets = allCells.filter(cell => {
            const opened = cell.getParameter<boolean>('opened');
            const type = cell.getParameter<number>('type');

            if (!opened || type !== enemyType) return false;

            const enemyItems = cell.getSubObjects().filter(obj =>
                obj instanceof ItemSubObject &&
                obj.stealable &&
                !obj.isReadyToUse()
            );

            return enemyItems.length > 0;
        });

        return targets;
    }
}
