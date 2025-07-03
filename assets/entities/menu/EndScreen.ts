import { _decorator, Component, Label, director } from 'cc';
import { GameContext } from './GameContext';

const { ccclass, property } = _decorator;

@ccclass('EndScreen')
export class EndScreen extends Component {
    @property(Label)
    private resultLabel: Label | null = null;

    start() {
        const result = GameContext.instance.result;

        // Обновление текста
        if (this.resultLabel) {
            this.resultLabel.string = result === 'victory' ? '🎉 Победа!' : '💀 Поражение';
        }

        // Кнопка "Переиграть"
        const retryButton = this.node.getChildByName('RetryButton');
        if (retryButton) {
            retryButton.active = result === 'defeat';
        }
    }

    public returnToMainMenu() {
        GameContext.instance.reset(); // 💡 Очищаем выбранный уровень и результат
        director.loadScene('MainMenu');
    }

    public retryLevel() {
        director.loadScene('scene_game_field-hexa');
    }
}
