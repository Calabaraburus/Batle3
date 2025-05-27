import { _decorator, Component } from 'cc';
import { HexGridManager } from './HexGridManager';
import { HexCell } from './HexCell';
import { TurnLabelController } from './TurnLabelController';
import { UnitSubObject } from './UnitSubObject';
import { UnitGroupManager } from './UnitGroupManager';
import { ItemSubObject } from './ItemSubObject';
import { GridCell } from './GridCell';

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
    private selectedItem: ItemSubObject | null = null;

    onLoad() {
        BattleController.instance = this;
    }

    start() {
        this.currentTurn = Turn.Player;
        this.updateTurnLabel();
    }

    updateTurnLabel() {
        const label = this.turnLabelController;
        if (label) {
            const text = this.currentTurn === Turn.Player ? 'Ваш хід' : 'Хід противника';
            label.show(text, 1.5);
        }
    }

    /**
     * Помечает клетку как открытую и убирает туман войны.
     */
    openAndRevealCell(cell: GridCell) {
        cell.addParameter('opened', true);
        this.gridManager?.revealCell(cell);

        const hexCell = cell.getVisualNode()?.getComponent(HexCell);
        hexCell?.markAsOpened();
        hexCell?.showDestroyedEffect?.();
    }

    /**
     * Выполняет обычную атаку на клетку игроком (по врагу).
     * После атаки ход завершается.
     */
    attackCell(cell: GridCell) {
        this.openAndRevealCell(cell);

        // Уничтожение юнита
        const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
        if (unit && unit.isAlive) {
            unit.markAsDead();
            UnitGroupManager.instance.onUnitDestroyed(unit);
        }

        // Обработка предметов
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        if (item && !item.isReadyToUse()) {
            item.activate();           // Показать как "готовый к активации"
            this.selectedItem = item; // Запоминаем его
        }

        this.endTurn();
    }

    /**
     * Завершает ход и запускает поведение врага.
     */
    endTurn() {
        this.currentTurn = this.currentTurn === Turn.Player ? Turn.Enemy : Turn.Player;
        this.updateTurnLabel();

        if (this.currentTurn === Turn.Enemy) {
            setTimeout(() => this.botAct(), 1800);
        }
    }

    /**
     * Простая логика для бота: выбирает случайную ячейку игрока.
     */
    botAct() {
        if (!this.gridManager) return;

        const targets = this.gridManager.getAllCells()
            .filter(c => c.getParameter('type') === 1 && !c.getParameter('opened'));

        if (targets.length === 0) return this.endTurn();

        const target = targets[Math.floor(Math.random() * targets.length)];
        this.openAndRevealCell(target);

        const unit = target.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
        if (unit && unit.isAlive) {
            unit.markAsDead();
            UnitGroupManager.instance.onUnitDestroyed(unit);
        }

        this.endTurn();
    }

    /**
     * Основной обработчик клика игрока по ячейке.
     */
    public onCellClicked(hexCell: HexCell): void {
        if (this.currentTurn !== Turn.Player || !this.gridManager) return;

        const cell = hexCell.getLogicalCell();
        if (!cell) return;

        const isOpened = cell.getParameter('opened') === true;

        // 1. Если предмет уже выбран и готов к использованию
        if (this.tryUseSelectedItem(cell)) return;

        // 2. Если можно активировать предмет на ячейке (вражеский предмет)
        if (this.tryActivateItem(cell)) return;

        // 3. Если ячейка открыта, но ничего не произошло
        if (isOpened) return;

        // 4. Обычная атака
        this.attackCell(cell);
    }

    /** Попытка применить ранее выбранный предмет */
    private tryUseSelectedItem(cell: GridCell): boolean {
        if (!this.selectedItem || !this.selectedItem.isReadyToArm()) return false;

        const success = this.selectedItem.tryApplyEffectTo(cell);
        if (success) {
            this.selectedItem = null;
            // ❗ Ход НЕ завершается (по логике предметов)
        }
        return true;
    }

    /** Попытка активировать предмет в ячейке */
    private tryActivateItem(cell: GridCell): boolean {
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        const playerType = this.currentTurn === Turn.Player ? 1 : 2;

        if (item && item.canBeActivatedBy(cell, playerType)) {
            if (!item.isReadyToArm()) {
                item.arm(); // переводим в состояние "готов к применению"
            }
            this.selectedItem = item;
            return true;
        }

        return false;
    }
}
