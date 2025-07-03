import { _decorator, Component } from 'cc';
import { LevelManager } from '../levels/LevelManager';
import { GameContext } from './GameContext';

const { ccclass } = _decorator;

@ccclass('GameStarter')
export class GameStarter extends Component {
    start() {
        const levelName = GameContext.instance.selectedLevel;
        if (!levelName) {
            console.error('[GameStarter] Нет выбранного уровня');
            return;
        }

        LevelManager.instance?.loadLevelFromJson(levelName);
    }
}
