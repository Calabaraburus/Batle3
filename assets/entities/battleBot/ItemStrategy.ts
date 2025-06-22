import { ItemSubObject } from "../bonusItems/ItemSubObject";
import { GridCell } from "../field/GridCell";


export interface ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: ItemSubObject): GridCell[];
}
