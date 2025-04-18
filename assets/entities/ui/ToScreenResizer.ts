import { _decorator, Camera, Component, director, UITransform, Vec3, view } from 'cc';
import { shell } from 'electron';
const { ccclass, property } = _decorator;

@ccclass('ToScreenResizer')
export class ToScreenResizer extends Component {

    public scale: number;

    start(): void {
        const a = view.getVisibleSize();
        const uiTrfrm = this.getComponent(UITransform);

        if (uiTrfrm == null) return;

        if (uiTrfrm.anchorY == 1) {
            const dp = this.node.worldPosition.y - uiTrfrm.contentSize.height;
            if (dp < 0) {
                this.scale = (uiTrfrm.contentSize.height + dp) / uiTrfrm.contentSize.height;
                this.node.scale = new Vec3(this.scale, this.scale, 1);
            }
        } else if (uiTrfrm.anchorY == 0) {
            const dp = this.node.worldPosition.y + uiTrfrm.contentSize.height;
            const sHeight = view.getVisibleSize().height;
            if (dp > sHeight) {
                this.scale = (uiTrfrm.contentSize.height - (dp - sHeight)) / uiTrfrm.contentSize.height;
                this.node.scale = new Vec3(this.scale, this.scale, 1);
            }
        } else {
            const dp = a.height - uiTrfrm.contentSize.height;

            if (dp < 0) {
                this.scale = (uiTrfrm.contentSize.height + dp) / uiTrfrm.contentSize.height;
                this.node.scale = new Vec3(this.scale, this.scale, 1);

            }
        }
    }
}
