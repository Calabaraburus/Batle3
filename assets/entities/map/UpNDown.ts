import { _decorator, CCFloat, Component, Node, Quat, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UpNDown')
export class UpNDown extends Component {
    @property(CCFloat)
    k = 0.1;

    @property(CCFloat)
    time = 1;

    start() {

        const initPosition = this.node.position.clone();
        const toPosition = initPosition.clone();

        toPosition.add(new Vec3(0, this.k, 0));

        tween(this.node).repeatForever(
            tween(this.node)
                .to(this.time, { position: toPosition }, { easing: "quadOut" })
                .to(this.time, { position: initPosition }, { easing: "quadIn" }))
            .start();

    }
}
