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
        if (this.turnLabelController) {
            const text = this.currentTurn === Turn.Player ? 'Ваш хід' : 'Хід противника';
            this.turnLabelController.show(text, 1.5);
        }
    }

    /**
     * Помечает клетку как открытую и убирает туман войны.
     */
    openAndRevealCell(cell: ReturnType<HexGridManager['getCell']>) {
        if (!cell) return;

        cell.addParameter('opened', true);
        this.gridManager?.revealCell(cell);

        const hexCell = cell.getVisualNode()?.getComponent(HexCell);
        hexCell?.markAsOpened();
        hexCell?.showDestroyedEffect?.();
    }

    /**
     * Выполняет обычную атаку на клетку.
     */
    attackCell(cell: ReturnType<HexGridManager['getCell']>) {
        if (!cell) return;

        this.openAndRevealCell(cell);

        // Уничтожение юнита
        const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
        if (unit && unit.isAlive) {
            unit.markAsDead();
            UnitGroupManager.instance.onUnitDestroyed(unit);
        }

        // Проверка на предмет
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        if (item && !item.isReadyToUse()) {
            item.activate();           // Показать как "доступный к активации"
            this.selectedItem = item;     // Запоминаем предмет
        }

        this.endTurn();
    }

    endTurn() {
        this.currentTurn = this.currentTurn === Turn.Player ? Turn.Enemy : Turn.Player;
        this.updateTurnLabel();

        if (this.currentTurn === Turn.Enemy) {
            setTimeout(() => this.botAct(), 1800);
        }
    }

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
     * Основной обработчик клика по клетке.
     */
    public onCellClicked(hexCell: HexCell): void {
        if (this.currentTurn !== Turn.Player || !this.gridManager) return;

        const cell = hexCell.getLogicalCell();
        if (!cell) return;

        const isOpened = cell.getParameter('opened') === true;

        // 1. Если предмет уже выбран и готов — применяем к цели
        if (this.tryUseSelectedItem(cell)) return;

        // 2. Если ячейка содержит активируемый предмет — активируем его (без завершения хода)
        if (this.tryActivateItem(cell)) return;

        // 3. Если ячейка открыта, но ничего не происходит — выходим
        if (isOpened) return;

        // 4. Иначе — обычная атака, завершающая ход
        this.attackCell(cell);
    }

    /** Применение выбранного предмета */
    private tryUseSelectedItem(cell: GridCell): boolean {
        if (!this.selectedItem || !this.selectedItem.isReadyToArm()) return false;

        const success = this.selectedItem.tryApplyEffectTo(cell);
        if (success) {
            this.selectedItem = null;
            // 🔸 Ход НЕ завершается, как по заданной логике
        }
        return true;
    }

    /** Попытка активировать предмет в ячейке */
    private tryActivateItem(cell: GridCell): boolean {
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        const playerType = this.currentTurn === Turn.Player ? 1 : 2;

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
