import { _decorator, Button, EventHandheld, EventHandler, Node } from 'cc';
import { Service } from '../services/Service';
import { AudioManagerService } from '../../soundsPlayer/AudioManagerService';
const { ccclass, property } = _decorator;

@ccclass('AudioableButton')
export class AudioableButton extends Service {

    static audioMgr: AudioManagerService | null;
    private _btn: Button | null;

    start() {
        if (AudioableButton.audioMgr == null) {
            AudioableButton.audioMgr = this.getServiceOrThrow(AudioManagerService);
        }

        this._btn = this.getComponent(Button);

        if (this._btn) {
            const clickEventHandler = new EventHandler();
            // This node is the node to which your event handler code component belongs
            clickEventHandler.target = this.node;
            // This is the script class name
            clickEventHandler.component = 'AudioableButton';
            clickEventHandler.handler = 'btnClick';

            this._btn.clickEvents.push(clickEventHandler);
        }
    }

    btnClick() {
        if (AudioableButton.audioMgr != null) {
            AudioableButton.audioMgr.playSoundEffect("buttonClick");
        }
    }
}