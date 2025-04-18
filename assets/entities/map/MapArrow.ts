import { _decorator, CCFloat, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('MapArrow')
@executeInEditMode()
export class MapArrow extends Component {

    @property(CCFloat)
    distance = 10;

    @property(CCFloat)
    rate = 0.5;

    start() {

        const oPos = this.node.position.clone();
        const toPos = this.node.position.clone();
        toPos.y -= this.distance;

        tween(this.node).repeatForever(
            tween(this.node)
                .to(this.rate, { position: toPos }, { easing: "quadIn" })
                .to(this.rate, { position: oPos }, { easing: "quadOut" }))
            .start();
    }
}


