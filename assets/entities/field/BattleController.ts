import { _decorator, Component } from 'cc';
import { HexGridManager } from './HexGridManager';
import { HexCell } from './HexCell';
import { TurnLabelController } from './TurnLabelController';
import { UnitSubObject } from './UnitSubObject';

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

    onLoad() {
        BattleController.instance = this;
    }

    start() {
        this.currentTurn = Turn.Player;
        this.updateTurnLabel();
    }

    updateTurnLabel() {
        if (this.turnLabelController) {
            const text = this.currentTurn === Turn.Player ? 'Ваш ход' : 'Ход врага';
            this.turnLabelController.show(text, 1.5);
        }
    }

    attackCell(x: number, y: number) {
        if (!this.gridManager) return;

        const cell = this.gridManager.getCell(x, y);
        if (!cell) return;

        const cellType = cell.getParameter<number>('type');
        if (this.currentTurn === Turn.Player && cellType === 2) {
            cell.addParameter('opened', true);

            const visual = cell.getVisualNode();
            if (visual) {
                const hexCell = visual.getComponent(HexCell);
                hexCell?.markAsOpened();

                const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
                if (unit && unit.isAlive) {
                    unit.markAsDead(); // сменит спрайт через BaseUnitVisual
                }
            }

            this.gridManager.revealCell(cell);
            this.endTurn();
        }
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
        target.addParameter('opened', true);
        this.gridManager.revealCell(target);

        const visual = target.getVisualNode();
        if (visual) {
            const hexCell = visual.getComponent(HexCell);
            hexCell?.markAsOpened();

            const unit = target.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
            if (unit && unit.isAlive) {
                unit.markAsDead();
            }
        }

        this.endTurn();
    }

    onCellClicked(hexCell: HexCell): void {
        console.log(`[BattleController] onCellClicked`);
        if (this.currentTurn !== Turn.Player) return;

        const cell = hexCell.getLogicalCell();
        if (!cell) {
            console.warn(`[BattleController] No logical cell found`);
            return;
        }

        const x = cell.getParameter<number>('x');
        const y = cell.getParameter<number>('y');

        console.log(`[BattleController] Click on (${x}, ${y})`);

        if (typeof x === 'number' && typeof y === 'number') {
            this.attackCell(x, y);
        }
    }
}
