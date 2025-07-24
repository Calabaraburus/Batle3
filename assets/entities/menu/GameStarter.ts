import { _decorator, Component } from 'cc';
import { LevelManager } from '../levels/LevelManager';
import { GameContext } from './GameContext';
import { TutorialManager } from '../tutorial/TutorialManager';
import { BattleController } from '../battle/BattleController';
import { AudioConfigurator } from '../services/AudioConfigurator';

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

        // 💥 Переключаем музыку
        const audioConfig = AudioConfigurator.instance;
        if (audioConfig) {
            if (levelName === 'level_tutorial') {
                audioConfig.applyList(["music_intro"]);  // например, отдельная музыка для туториала
            } else {
                audioConfig.applyList(audioConfig.levelMusicList);
            }
        } else {
            console.warn('AudioConfigurator instance not found!');
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
