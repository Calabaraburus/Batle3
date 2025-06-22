import { _decorator, Component, Label } from 'cc';
import { ScoreManager } from '../pointsSystem/ScoreManager';
import { Turn } from '../battle/BattleController';

const { ccclass, property } = _decorator;

@ccclass('BattleUIPanel')
export class BattleUIPanel extends Component {
    @property({ type: Label })
    turnLabel: Label | null = null;

    @property({ type: Label })
    turnCounterLabel: Label | null = null;

    @property({ type: Label })
    scoreLabel: Label | null = null;

    private currentTurnCount = 1;

    public updateTurn(turn: Turn) {
        if (this.turnLabel) {
            this.turnLabel.string = turn === Turn.Player ? 'Player turn' : 'Enemy turn';
        }

        if (turn === Turn.Player) {
            this.currentTurnCount += 1;
            this.updateTurnCounter();
        }
    }

    public updateScoreDisplay() {
        if (this.scoreLabel) {
            this.scoreLabel.string = `Freedomit: ${ScoreManager.instance.getScore()}`;
        }
    }

    private updateTurnCounter() {
        if (this.turnCounterLabel) {
            this.turnCounterLabel.string = `Turn count: ${this.currentTurnCount}`;
        }
    }

    public reset() {
        this.currentTurnCount = 1;
        this.updateTurnCounter();
        this.updateScoreDisplay();
    }
}
