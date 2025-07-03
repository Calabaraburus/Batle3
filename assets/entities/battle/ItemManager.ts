import { GridCell } from '../field/GridCell';
import { ItemSubObject } from '../bonusItems/ItemSubObject';
import { TurnManager } from './TurnManager';
import { VictoryChecker } from '../../resources/levels/VictoryChecker';

export class ItemManager {
    public static instance: ItemManager;

    private selectedItem: ItemSubObject | null = null;
    private allCells: GridCell[] = [];

    constructor(allCells: GridCell[]) {
        ItemManager.instance = this;
        this.allCells = allCells;
    }

    public selectItemOnCell(cell: GridCell): boolean {
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        const playerType = TurnManager.instance.isPlayerTurn() ? 1 : 2;

        if (cell.getParameter('type') === playerType) return false;

        if (item && item.canBeActivatedBy(cell, playerType)) {
            if (!item.isReadyToArm()) {
                item.arm();
            }
            this.selectedItem = item;
            return true;
        }
        return false;
    }

    public async tryUseSelectedItemOn(cell: GridCell): Promise<boolean> {
        if (!this.selectedItem || !this.selectedItem.isReadyToArm()) return false;

        const success = this.selectedItem.tryApplyEffectTo(cell);
        if (success) {
            this.selectedItem = null;
            await this.tryAutoTriggerItems();

            // ✅ Выполняем проверку победы после успешного применения предмета
            VictoryChecker.instance?.checkVictory();
            
            return true;
        }
        return true;
    }

    public async tryAutoTriggerItems(): Promise<boolean> {
        for (const cell of this.allCells) {
            if (await this.tryAutoTriggerItemsOnCell(cell)) {
                return true;
            }
        }
        return false;
    }

    public async tryAutoTriggerItemsOnCell(cell: GridCell): Promise<boolean> {
        const isOpened = cell.getParameter('opened') === true;
        if (!isOpened) return false;

        const autoItem = cell.getSubObjects().find(obj =>
            obj instanceof ItemSubObject &&
            obj.isAutoTriggered &&
            !obj.isReadyToUse()
        ) as ItemSubObject;

        if (autoItem) {
            const triggered = autoItem.tryApplyEffectTo(cell);
            if (triggered) {
                this.selectedItem = null;
                return true;
            }
        }
        return false;
    }

    public reset(): void {
        this.selectedItem = null;
    }

    public getSelectedItem(): ItemSubObject | null {
        return this.selectedItem;
    }
}
