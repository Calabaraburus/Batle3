import { CCFloat, Component, UIOpacity, _decorator, assert, tween } from "cc";

const { ccclass, property } = _decorator;
@ccclass("StartWndLabel")
export class StartWndLabel extends Component {

    @property(CCFloat)
    startTime = 3;

    start() {
        const opacity = this.node.getComponent(UIOpacity);
        assert(opacity != null);

        opacity.opacity = 0;

        this.scheduleOnce(
            () => tween(opacity)
                .repeatForever(tween(opacity).to(1, { opacity: 255 }).to(1, { opacity: 100 }))
                .start()
            , 3);

    }
}
