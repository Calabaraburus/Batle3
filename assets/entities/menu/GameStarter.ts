import { _decorator, Component } from 'cc';
import { LevelManager } from '../levels/LevelManager';
import { GameContext } from './GameContext';
import { TutorialManager } from '../tutorial/TutorialManager';
import { BattleController } from '../battle/BattleController';

const { ccclass } = _decorator;

@ccclass('GameStarter')
export class GameStarter extends Component {
    start() {
        this.runGame();
    }

    private async runGame() {
        const levelName = GameContext.instance.selectedLevel;
        if (!levelName) {
            console.error('[GameStarter] Нет выбранного уровня');
            return;
        }

        await LevelManager.instance.loadLevelFromJson(levelName);

        // Запуск обычного уровня или туториала
        if (levelName === 'level_tutorial') {
            TutorialManager.instance.startTutorial();
        } else {
            BattleController.instance?.start();
        }
    }
}
