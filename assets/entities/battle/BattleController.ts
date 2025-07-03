import { _decorator, Component, Node } from 'cc';
import { BattleUIPanel } from '../UI_components/BattleUIPanel';
import { ScoreManager } from '../pointsSystem/ScoreManager';
import { HexGridManager } from '../field/HexGridManager';
import { BattleBot } from '../battleBot/BattleBot';
import { GridCell } from '../field/GridCell';
import { HexCell } from '../field/HexCell';
import { VisualEffectPlayer } from '../battleEffects/VisualEffectPlayer';
import { TurnManager } from './TurnManager';
import { AttackManager } from './AttackManager';
import { ItemManager } from './ItemManager';
import { ItemSubObject } from '../bonusItems/ItemSubObject';

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

    @property({ type: Node })
    battleUIPanelNode: Node | null = null;

    private battleUIPanel: BattleUIPanel | null;
    public bot: BattleBot;

    onLoad() {
        BattleController.instance = this;
    }

    start() {
        if (!this.gridManager) return;

        const allCells = this.gridManager.getAllCells();

        // 🧠 Инициализация бота
        this.bot = new BattleBot(
            this.gridManager,
            () => this.delayedEndTurn(),
            (cell) => this.openAndRevealCell(cell),
            (cell) => AttackManager.instance.attack(cell)
        );

        // 🧩 Инициализация менеджеров
        new ItemManager(allCells);
        new AttackManager();

        TurnManager.instance = new TurnManager();
        TurnManager.instance.gridManager = this.gridManager;

        // 🎛️ UI-панель
        if (this.battleUIPanelNode) {
            this.battleUIPanel = this.battleUIPanelNode?.getComponent(BattleUIPanel);
            if (this.battleUIPanel) {
                ScoreManager.instance.init(this.battleUIPanel);
            }
        }

    }

    /**
     * Обновление надписи текущего хода
     */
    updateTurnLabel() {
        this.battleUIPanel?.updateTurn(TurnManager.instance.getCurrentTurn());
    }

    /**
     * запустить первый ход
     */
    public startBattle() {
        this.updateTurnLabel();
        TurnManager.instance.startFirstTurn();
    }

    /**
     * Открытие клетки и отображение разрушения
     */
    openAndRevealCell(cell: GridCell) {
        if (!cell || TurnManager.instance.isTurnFrozen()) return; // 🧊 Добавлена защита

        cell.addParameter('opened', true);
        this.gridManager?.revealCell(cell);

        const hexCell = cell.getVisualNode()?.getComponent(HexCell);
        hexCell?.markAsOpened();
        hexCell?.showDestroyedEffect?.();

        // 🟢 Включаем визуал всех субобъектов
        for (const sub of cell.getSubObjects()) {
            if (typeof sub.setHidden === 'function') {
                sub.setHidden(false);
            }
        }

        ItemManager.instance.tryAutoTriggerItemsOnCell(cell);
    }

    /**
     * Обработка клика по гексу
     */
    public onCellClicked(hexCell: HexCell): void {
        if (TurnManager.instance.isTurnFrozen()) return; // ✅ Защита
        if (!TurnManager.instance.isPlayerTurn() || !this.gridManager) return;

        const cell = hexCell.getLogicalCell();
        if (!cell) return;

        const isOpened = cell.getParameter('opened') === true;
        const cellType = cell.getParameter<number>('type');
        const playerType = 1;

        // 🎯 Порядок обработки: активировать предмет -> выбрать предмет -> удар
        ItemManager.instance.tryUseSelectedItemOn(cell).then((used) => {
            if (used) return;

            if (ItemManager.instance.selectItemOnCell(cell)) return;

            if (isOpened || cellType === playerType) return;

            AttackManager.instance.attack(cell);
        });
    }

    /**
     * вызов конца хода с ожиданием завершения анимаций
     */
    public async delayedEndTurn(): Promise<void> {
        // ⏳ Ждём завершения всех визуальных эффектов
        await VisualEffectPlayer.instance.waitForAllEffects();

        // ✅ Завершаем ход
        await TurnManager.instance.endCurrentTurn();
    }

    /**
     * Анимация взрыва
     */
    protected playExplosionEffect(cell: GridCell): void {
        VisualEffectPlayer.instance.playExplosion(cell);
    }

    /**
     * Сброс временных эффектов, предметов и состояний
     */
    public clearTemporaryStates(): void {
        ItemManager.instance.reset();
    }
}
