import { _decorator, Component, Node, Settings, settings, UITransform, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AspectRatioResizer')
export class AspectRatioResizer extends Component {
    start() {
        const dr = view.getDesignResolutionSize();

        const res = view.getVisibleSize();

        const ar1 = dr.width / dr.height;
        const ar2 = res.width / res.height;
        if (ar1 < ar2) {
            this.node.scale = new Vec3(ar1 / ar2, ar1 / ar2, 1);
        }
    }
}


