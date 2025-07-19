import { _decorator, Component, BlockInputEvents } from 'cc';
const { ccclass } = _decorator;

@ccclass('UIBlocker')
export class UIBlocker extends Component {
    onLoad() {
        // Обеспечиваем перехват всех событий
        this.node.addComponent(BlockInputEvents);
    }
}
