import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;

@ccclass('IntroSceneController')
export class IntroSceneController extends Component {
    /**
     * Метод вызывается при клике на кнопку "Начать".
     */
    public onStartButtonClick(): void {
        director.loadScene('MainMenu'); // Замените на точное имя вашей сцены
    }
}
