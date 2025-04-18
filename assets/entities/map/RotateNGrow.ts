import { _decorator, CCFloat, Component, Node, Quat, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RotateNGrow')
export class RotateNGrow extends Component {
    @property(CCFloat)
    KRotate = 0.1;

    @property(CCFloat)
    KGrow = 0.1;

    @property(CCFloat)
    timeRotate = 1;

    @property(CCFloat)
    timeGrow = 1;

    start() {

        const initScale = this.node.scale.clone();
        const initRotation = this.node.getRotation().clone();

        const toScale = new Vec3(initScale.x + this.KGrow * initScale.x,
            initScale.y + this.KGrow * initScale.y, 1)

        const toRotation = initRotation.clone();

        Quat.fromEuler(toRotation, 0, 0, 360 * this.KRotate);

        tween(this.node).repeatForever(
            tween(this.node)
                .to(this.timeGrow, { scale: toScale }, { easing: "quadOut" })
                .to(this.timeGrow, { scale: initScale }, { easing: "quadIn" }))
            .start();

        tween(this.node).repeatForever(
            tween(this.node)
                .to(this.timeRotate, { rotation: toRotation }, { easing: "quadOut" })
                .to(this.timeRotate, { rotation: initRotation }, { easing: "quadIn" }))
            .start();
    }
}

