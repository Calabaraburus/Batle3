import { _decorator } from 'cc';

/**
 * Хранилище глобальных параметров игры между сценами.
 */
export class GameContext {
    private static _instance: GameContext;

    /** Выбранный уровень */
    public selectedLevel = '';

    /** Результат последнего боя */
    public result: 'victory' | 'defeat' = 'victory';

    /** Получить синглтон */
    public static get instance(): GameContext {
        if (!this._instance) {
            this._instance = new GameContext();
        }
        return this._instance;
    }

    /** Очистить все параметры */
    public reset(): void {
        this.selectedLevel = '';
        this.result = 'victory';
    }
}
