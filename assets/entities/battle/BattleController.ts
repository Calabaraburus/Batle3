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
import { TutorialManager } from '../tutorial/TutorialManager';
import { SubObjectGenerator } from '../subObjects/SubObjectGenerator';

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

    private battleUIPanel: BattleUIPanel | null = null;
    public bot: BattleBot;

    onLoad() {
        BattleController.instance = this;
    }

    public async start(): Promise<void> {
        if (!this.gridManager) return;

        const allCells = this.gridManager.getAllCells();

        this.bot = new BattleBot(
            this.gridManager,
            () => this.delayedEndTurn(),
            (cell) => this.openAndRevealCell(cell),
            (cell) => AttackManager.instance.attack(cell)
        );

        new ItemManager(allCells);
        new AttackManager();

        TurnManager.instance = new TurnManager();
        TurnManager.instance.gridManager = this.gridManager;

        if (this.battleUIPanelNode) {
            this.battleUIPanel = this.battleUIPanelNode.getComponent(BattleUIPanel);
            if (this.battleUIPanel) {
                ScoreManager.instance.init(this.battleUIPanel);
            }
        }

        if (!SubObjectGenerator.instance.useLevelConfig) {
            await SubObjectGenerator.instance.generateObjects();
        }

        this.startBattle();
    }

    public startBattle() {
        this.updateTurnLabel();
        TurnManager.instance.startFirstTurn();
    }

    updateTurnLabel() {
        this.battleUIPanel?.updateTurn(TurnManager.instance.getCurrentTurn());
    }

    public openAndRevealCell(cell: GridCell) {
        if (!cell || TurnManager.instance.isTurnFrozen()) return;

        cell.addParameter('opened', true);
        this.gridManager?.revealCell(cell);

        const hexCell = cell.getVisualNode()?.getComponent(HexCell);
        hexCell?.markAsOpened();
        hexCell?.showDestroyedEffect?.();

        for (const sub of cell.getSubObjects()) {
            if (typeof sub.setHidden === 'function') {
                sub.setHidden(false);
            }
        }

        ItemManager.instance.tryAutoTriggerItemsOnCell(cell);
    }

    public onCellClicked(hexCell: HexCell): void {
        if (TurnManager.instance.isTurnFrozen()) return;
        if (!TurnManager.instance.isPlayerTurn() || !this.gridManager) return;

        // 🧭 Проверка туториала
        if (TutorialManager.instance.isActive) {
            // const allowed = TutorialManager.instance.canClickCell(hexCell);
            // if (!allowed) return;
            // TutorialManager.instance.handleCellClick(hexCell);
            TutorialManager.instance.nextStep();
        }

        const cell = hexCell.getLogicalCell();
        if (!cell) return;

        const isOpened = cell.getParameter('opened') === true;
        const cellType = cell.getParameter<number>('type');
        const playerType = 1;

        ItemManager.instance.tryUseSelectedItemOn(cell).then((used) => {
            if (used) return;

            if (ItemManager.instance.selectItemOnCell(cell)) return;

            if (isOpened || cellType === playerType) return;

            AttackManager.instance.attack(cell);
        });
    }

    public async delayedEndTurn(): Promise<void> {
        await VisualEffectPlayer.instance.waitForAllEffects();
        await TurnManager.instance.endCurrentTurn();
    }

    public clearTemporaryStates(): void {
        ItemManager.instance.reset();
    }
}
