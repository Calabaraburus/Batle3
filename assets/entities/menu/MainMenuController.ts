import { _decorator, Component, director } from 'cc';
import { GameContext } from './GameContext';

const { ccclass } = _decorator;

@ccclass('MainMenuController')
export class MainMenuController extends Component {

    start() {
        GameContext.instance.reset(); // 💡 На всякий случай сбрасываем при первом заходе в главное меню
    }

    /**
     * Загружает сцену битвы и сохраняет выбранный уровень в GameContext
     */
    public startLevel(event: Event, levelName: string) {
        console.log('Запуск игры!');
        GameContext.instance.selectedLevel = levelName;
        director.loadScene('scene_game_field-hexa');
    }
}
