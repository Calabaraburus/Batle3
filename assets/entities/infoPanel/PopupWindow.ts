import {
  _decorator,
  Component,
  Node,
  UIOpacity,
  tween,
  Vec2,
  Vec3,
  find,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PopupWindow")
export class PopupWindow extends Component {
  @property
  initPosition: Vec3 = new Vec3(0, 2320, 0);
  @property
  finalePosition: Vec3 = new Vec3(0, 0, 0);

  get _overlay() {
    return find("Overlay", this.node);
  }

  showWindow() {
    if (!this._overlay) return;

    this._overlay.active = true;

    tween(this._overlay.getComponent(UIOpacity))
      .to(0.2, { opacity: 200 }, { easing: "linear" })
      .start();

    this.node.active = true;
    tween(this.node)
      .to(0.3, { position: this.finalePosition }, { easing: "linear" })
      .start();
  }

  hideWindow() {
    tween(this.node)
      .to(0.3, { position: this.initPosition }, { easing: "linear" })
      .call(() => {
        this.node.active = false;
      })
      .start();

    if (!this._overlay) return;
    tween(this._overlay.getComponent(UIOpacity))
      .to(0.4, { opacity: 0 }, { easing: "linear" })
      .call(() => {
        if (this._overlay) {
          this._overlay.active = false;
        }
      })
      .start();
  }

  closeButton() {
    return;
  }
}
