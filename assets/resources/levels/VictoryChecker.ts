import { TurnManager } from "../../entities/battle/TurnManager";
import { UnitGroupManager } from "../../entities/battle/UnitGroupManager";
import { CaptiveItemObject } from "../../entities/bonusItems/captive/CaptiveItemObject";
import { GridCell } from "../../entities/field/GridCell";
import { director } from "cc";
import { GameContext } from "../../entities/menu/GameContext";

/**
 * Описание условий победы
 */
export interface VictoryCondition {
    type: 'eliminateAllEnemies' | 'killHero' | 'eliminateAllEnemiesInTurns' | 'activateCaptives';
    maxTurns?: number;          // Максимальное количество ходов для победы
    heroClassName?: string;     // Имя класса героя, которого нужно убить
}

/**
 * Проверяет выполнение условий победы/поражения
 */
export class VictoryChecker {
    private condition: VictoryCondition;
    public static instance: VictoryChecker | null;

    private static isSceneTransitioning = false; // 🛑 Защита от повторной загрузки сцены

    constructor(condition: VictoryCondition) {
        this.condition = condition;
        VictoryChecker.instance = this;
    }

    /**
     * Основной метод проверки условий победы
     */
    public checkVictory(): void {
        if (VictoryChecker.isSceneTransitioning) return;

        switch (this.condition.type) {
            case 'eliminateAllEnemies':
                this.checkEliminateAllEnemies();
                break;
            case 'killHero':
                if (this.condition.heroClassName) {
                    this.checkKillHero(this.condition.heroClassName);
                }
                break;
            case 'eliminateAllEnemiesInTurns':
                if (this.condition.maxTurns) {
                    this.checkEliminateAllEnemiesInTurns(this.condition.maxTurns);
                }
                break;
            case 'activateCaptives':
                this.checkActivateCaptives();
                break;
            default:
                console.warn(`[VictoryChecker] Неизвестное условие: ${this.condition.type}`);
        }
    }

    /**
     * Победа, если все враги мертвы. Поражение, если все игроки мертвы.
     */
    private checkEliminateAllEnemies(): void {
        const playerAlive = UnitGroupManager.instance.getAllPlayerGroups().some(g => g.units.some(u => u.isAlive));
        const enemyAlive = UnitGroupManager.instance.getAllEnemyGroups().some(g => g.units.some(u => u.isAlive));
        if (!enemyAlive) this.onVictory();
        else if (!playerAlive) this.onDefeat();
    }

    /**
     * Победа, если указанный герой мертв
     */
    private checkKillHero(heroClassName: string): void {
        const hero = UnitGroupManager.instance.getAllUnits().find(u => u.constructor.name === heroClassName);
        if (hero && !hero.isAlive) this.onVictory();
    }

    /**
     * Победа, если все враги мертвы за указанное количество ходов
     * Поражение, если ходов больше лимита
     */
    private checkEliminateAllEnemiesInTurns(maxTurns: number): void {
        if (TurnManager.instance.getTurnCount() > maxTurns) {
            this.onDefeat();
            return;
        }
        const enemyAlive = UnitGroupManager.instance.getAllEnemyGroups().some(g => g.units.some(u => u.isAlive));
        if (!enemyAlive) this.onVictory();
    }

    /**
     * Победа, если все пленники (captives) активированы
     */
    private checkActivateCaptives(): void {
        const allCaptives = CaptiveItemObject.allCaptives;
        if (allCaptives.length > 0 && allCaptives.every(c => c.isUsedPublic)) {
            this.onVictory();
        }
        const playerAlive = UnitGroupManager.instance.getAllPlayerGroups().some(g => g.units.some(u => u.isAlive));
        if (!playerAlive) this.onDefeat();
    }

    /**
     * Обработка победы игрока
     */
    private onVictory(): void {
        console.log('[VictoryChecker] 🎉 Победа!');
        TurnManager.endGame('victory');
    }

    /**
     * Обработка поражения игрока
     */
    private onDefeat(): void {
        console.log('[VictoryChecker] 💀 Поражение!');
        TurnManager.endGame('defeat');
    }

    public static resetInstance(): void {
        this.instance = null;
        this.isSceneTransitioning = false;
    }

}
