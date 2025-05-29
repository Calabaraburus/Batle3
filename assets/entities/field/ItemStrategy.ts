import { GridCell } from "./GridCell";
import { ItemSubObject } from "./ItemSubObject";

export interface ItemStrategy {
    evaluateTargets(allCells: GridCell[], item: ItemSubObject): GridCell[];
}
