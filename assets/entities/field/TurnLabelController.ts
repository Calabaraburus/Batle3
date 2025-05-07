import { _decorator, Component, Label, UIOpacity, tween, easing } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TurnLabelController')
export class TurnLabelController extends Component {
    @property({ type: Label })
    label: Label | null = null;

    show(text: string, duration = 1.2) {
        if (!this.label) return;

        this.label.string = text;

        const labelNode = this.label.node;
        let opacity = labelNode.getComponent(UIOpacity);
        if (!opacity) {
            opacity = labelNode.addComponent(UIOpacity);
        }

        opacity.opacity = 0;

        // Анимация: быстрое плавное появление → задержка → плавное исчезновение
        tween(opacity)
            .to(0.2, { opacity: 255 }, { easing: easing.sineOut })  // быстрое появление
            .delay(duration)                                         // пауза
            .to(0.3, { opacity: 0 }, { easing: easing.sineIn })      // мягкое исчезновение
            .start();
    }
}
