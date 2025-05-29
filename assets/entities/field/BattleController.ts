import { _decorator, Component } from 'cc';
import { HexGridManager } from './HexGridManager';
import { HexCell } from './HexCell';
import { TurnLabelController } from './TurnLabelController';
import { UnitSubObject } from './UnitSubObject';
import { UnitGroupManager } from './UnitGroupManager';
import { ItemSubObject } from './ItemSubObject';
import { GridCell } from './GridCell';
import { BattleBot } from './BattleBot';

const { ccclass, property } = _decorator;

export enum Turn {
    Player,
    Enemy,
}

@ccclass('BattleController')
export class BattleController extends Component {
    public static instance: BattleController;

    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: TurnLabelController })
    turnLabelController: TurnLabelController | null = null;

    public currentTurn: Turn = Turn.Player;
    public selectedItem: ItemSubObject | null = null;

    private bot: BattleBot;

    onLoad() {
        BattleController.instance = this;
    }

    start() {
        if (this.gridManager) {
            this.bot = new BattleBot(
                this.gridManager,
                () => this.endTurn(),
                (cell: GridCell) => this.openAndRevealCell(cell)
            );
        }
        this.currentTurn = Turn.Player;
        this.updateTurnLabel();
    }

    updateTurnLabel() {
        if (this.turnLabelController) {
            const text = this.currentTurn === Turn.Player ? 'Ваш хід' : 'Хід противника';
            this.turnLabelController.show(text, 1.5);
        }
    }

    openAndRevealCell(cell: GridCell) {
        if (!cell) return;

        cell.addParameter('opened', true);
        this.gridManager?.revealCell(cell);

        const hexCell = cell.getVisualNode()?.getComponent(HexCell);
        hexCell?.markAsOpened();
        hexCell?.showDestroyedEffect?.();
    }

    attackCell(cell: GridCell) {
        if (!cell) return;

        this.openAndRevealCell(cell);

        const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
        if (unit && unit.isAlive) {
            unit.markAsDead();
            UnitGroupManager.instance.onUnitDestroyed(unit);
        }

        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        if (item && !item.isReadyToUse()) {
            item.activate();
            this.selectedItem = item;
        }

        this.endTurn();
    }

    endTurn() {
        this.currentTurn = this.currentTurn === Turn.Player ? Turn.Enemy : Turn.Player;
        this.updateTurnLabel();

        if (this.currentTurn === Turn.Enemy) {
            setTimeout(() => this.bot.act(), 800);
        }
    }

    public onCellClicked(hexCell: HexCell): void {
        if (this.currentTurn !== Turn.Player || !this.gridManager) return;

        const cell = hexCell.getLogicalCell();
        if (!cell) return;

        const isOpened = cell.getParameter('opened') === true;
        const cellType = cell.getParameter<number>('type');
        const playerType = 1;

        // 🔒 Игнорируем клик по своим клеткам вообще
        if (cellType === playerType) return;

        // 1. Применение активного предмета
        if (this.tryUseSelectedItem(cell)) return;

        // 2. Активация предмета на вражеском тайле
        if (this.tryActivateItem(cell)) return;

        // 3. Если уже открыта — ничего не делаем
        if (isOpened) return;

        // 4. Иначе — обычная атака
        this.attackCell(cell);
    }

    private tryUseSelectedItem(cell: GridCell): boolean {
        if (!this.selectedItem || !this.selectedItem.isReadyToArm()) return false;

        const success = this.selectedItem.tryApplyEffectTo(cell);
        if (success) {
            this.selectedItem = null;
        }
        return true;
    }

    private tryActivateItem(cell: GridCell): boolean {
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        const playerType = this.currentTurn === Turn.Player ? 1 : 2;

        // 🔒 Защита: нельзя активировать предметы на своих клетках
        if (cell.getParameter('type') === playerType) {
            return false;
        }

        if (item && item.canBeActivatedBy(cell, playerType)) {
            if (!item.isReadyToArm()) {
                item.arm();
            }
            this.selectedItem = item;
            return true;
        }
        return false;
    }

}
