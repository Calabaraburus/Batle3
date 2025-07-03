import { director, Director } from 'cc';
import { VictoryChecker } from '../../resources/levels/VictoryChecker';
import { BattleBot } from '../battleBot/BattleBot';
import { GridCell } from '../field/GridCell';
import { HexGridManager } from '../field/HexGridManager';
import { GameContext } from '../menu/GameContext';
import { Turn } from './BattleController';
import { BattleController } from './BattleController';
import { wait } from './TimeUtils';

export class TurnManager {
    public static instance: TurnManager;

    private turnCount = 1;
    private currentTurn: Turn = Turn.Player;
    
    private turnFrozen = false; // 🧊 Флаг, запрещающий любые действия после победы/поражения
    private static gameEnded = false; // 🛡 Дополнительная защита
    private animationInProgress = false; // флаг ожидания окончания фнимаций

    public gridManager: HexGridManager | null = null;

    constructor() {
        TurnManager.instance = this;
    }

    public getCurrentTurn(): Turn {
        return this.currentTurn;
    }

    public async startFirstTurn(): Promise<void> {
        this.currentTurn = Turn.Player;
        this.turnCount = 1;
        BattleController.instance.updateTurnLabel();
    }

    public async endCurrentTurn(): Promise<void> {
        if (this.isTurnFrozen()) return; // 🛑 Защита от перехода хода после окончания игры

        this.currentTurn = this.currentTurn === Turn.Player ? Turn.Enemy : Turn.Player;
        this.turnCount++;

        BattleController.instance.updateTurnLabel();

        // 🔄 Очистка временных эффектов
        BattleController.instance.clearTemporaryStates?.();

        // 🎲 Вызов событий вынесен во внешний менеджер (если появится)
        // GameEventManager.instance.checkAndTriggerEvent(this.turnCount);

        // 🤖 Запуск бота при необходимости
        if (this.currentTurn === Turn.Enemy) {
            await wait(1000);

            // 🧊 Повторная проверка перед действием бота
            if (this.isTurnFrozen()) return;

            BattleController.instance.bot.act();
        }

        // 🟡 Проверка победы в конце хода
        VictoryChecker.instance?.checkVictory();
    }

    public getTurnCount(): number {
        return this.turnCount;
    }

    public isPlayerTurn(): boolean {
        return this.currentTurn === Turn.Player;
    }

    public isEnemyTurn(): boolean {
        return this.currentTurn === Turn.Enemy;
    }

    /** Заморозить все действия в игре (после победы/поражения) */
    public freezeTurns(): void {
        this.turnFrozen = true;
    }

    public isTurnFrozen(): boolean {
        return this.turnFrozen;
    }

    /** Завершение игры с заданным результатом */
    public static endGame(result: 'victory' | 'defeat'): void {
        if (TurnManager.gameEnded) return;
        TurnManager.gameEnded = true;

        TurnManager.instance.freezeTurns();
        GameContext.instance.result = result;

        console.log(`[TurnManager] Завершение игры: ${result}`);

        director.once(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
            console.log('[VictoryChecker] Сцена EndScreen успешно загружена');
        });

        director.loadScene('EndScreen'); // ← это ВАЖНО
    }

    /** Получить все клетки на поле */
    public getAllCells(): GridCell[] {
        return this.gridManager?.getAllCells() ?? [];
    }

    public async waitForAnimationsIfNeeded(): Promise<void> {
        while (this.animationInProgress) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    public setAnimationInProgress(flag: boolean) {
        this.animationInProgress = flag;
    }

}
