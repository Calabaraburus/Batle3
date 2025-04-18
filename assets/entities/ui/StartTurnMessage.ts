import { _decorator, CCString, Color, Component, Label, Node, tween, UIOpacity, Vec3 } from 'cc';
import { LocalizedLabel } from '../../../extensions/i18n/assets/LocalizedLabel';
const { ccclass, property } = _decorator;

@ccclass('StartTurnMessage')
export class StartTurnMessage extends Component {
    @property({ type: Color })
    color_player: Color;

    @property({ type: Color })
    color_enemy: Color;

    @property(CCString)
    str_player: string = "label_text.startTurnMessage_player";

    @property(CCString)
    str_enemy: string = "label_text.startTurnMessage_enemy";

    _startScale: Vec3;

    start() {
        this.node.active = false;
        this._startScale = this.node.scale.clone();
    }

    show(playerTurn: boolean = true) {
        const localizableTxt = this.getComponent(LocalizedLabel);
        const label = this.getComponent(Label);
        this.node.active = true;
        if (localizableTxt && label) {
            localizableTxt.key = playerTurn ? this.str_player : this.str_enemy;
            localizableTxt.updateLabel();
            label.color = playerTurn ? this.color_player : this.color_enemy
        }

        const opacityUi = this.getComponent(UIOpacity);
        const node = this.node;

        if (opacityUi) {

            const msgObj = {
                set opacity(value: number) {
                    opacityUi.opacity = value;
                },
                get opacity() {
                    return opacityUi.opacity
                },
                set position(value: Vec3) {
                    node.position = value;
                },
                get position() {
                    return node.position;
                },

                set scale(value: Vec3) {
                    node.scale = value;
                },
                get scale() {
                    return node.scale;
                }
            }

            opacityUi.opacity = 0;

            const s1 = this._startScale.clone();
            const s2 = this._startScale.clone();

            s2.x = 1.2;
            s2.y = 3;

            tween(msgObj).set({ opacity: 0, scale: s2 }).to(0.2, { opacity: 255, scale: s1 }, { easing: "backInOut" })
                .delay(1.5)
                .to(0.2, { opacity: 0, scale: s2 }, { easing: "backOut" })
                .call(() => this.node.active = false).start();
        }
    }
}


