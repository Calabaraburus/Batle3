import { BattleController, Turn } from '../battle/BattleController';
import { BattleUIPanel } from '../UI_components/BattleUIPanel';

export class ScoreManager {
    private static instanceRef: ScoreManager;
    private score = 0;
    private comboMultiplier = 1;
    private hitPoints = 100;
    private uiPanel: BattleUIPanel | null = null;

    public static get instance(): ScoreManager {
        if (!this.instanceRef) {
            this.instanceRef = new ScoreManager();
        }
        return this.instanceRef;
    }

    public init(uiPanel: BattleUIPanel) {
        this.uiPanel = uiPanel;
        this.reset();
    }

    public reset() {
        this.score = 0;
        this.comboMultiplier = 1;
        this.updateUI();
    }

    public getScore(): number {
        return this.score;
    }

    public getCombo(): number {
        return this.comboMultiplier;
    }

    /** Вызывается при попадании — увеличивает счёт и коэффициент */
    public registerHit() {
        if (BattleController.instance.currentTurn !== Turn.Player) return;

        const points = this.hitPoints * this.comboMultiplier;
        this.score += points;
        console.log(`[SCORE] +${points} (Hit ×${this.comboMultiplier})`);
        this.comboMultiplier += 1;
        this.updateUI();
    }

    /** Вызывается при промахе — сбрасывает коэффициент */
    public registerMiss() {
        if (BattleController.instance.currentTurn !== Turn.Player) return;

        console.log(`[SCORE] Miss. Combo reset.`);
        this.comboMultiplier = 1;
    }

    /** Уничтожение группы (юнитов) */
    public registerGroupDestroyed(size: number) {
        if (BattleController.instance.currentTurn !== Turn.Player) return;

        const points = this.hitPoints * size;
        this.score += points;
        console.log(`[SCORE] +${points} (Group destroyed, size ${size})`);
        this.updateUI();
    }

    private updateUI() {
        this.uiPanel?.updateScoreDisplay();
    }
}
