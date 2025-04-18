import {
  _decorator,
  Color,
  Component,
  find,
  Node,
  ParticleSystem2D,
  Sprite,
  tween,
  UIOpacity,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("AttackSignalComponent")
export class AttackSignalComponent extends Component {
  active = false;
  opacity: UIOpacity | null;
  // wndIsShowing = false;
  // wndIsHiding = false;
  @property(ParticleSystem2D)
  particles: ParticleSystem2D;

  @property(UIOpacity)
  attackEfOpacity: UIOpacity
  private _isShowed: boolean;

  start() {
    this.opacity = this.node.getComponent(UIOpacity);
    this.opacity!.opacity = 0;
    this.particles.enabled = false;
    this.attackEfOpacity.opacity = 0;
  }

  attack() {
    if (this._isShowed) {
      tween(this.attackEfOpacity)
        .to(0.1, { opacity: 255 }, { easing: "cubicIn" })
        .to(0.5, { opacity: 0 }, { easing: "cubicOut" }).start();
    }
  }

  show() {
    this._isShowed = true;
    tween(this.opacity)
      .to(0.2, { opacity: 255 }, { easing: "quadIn" }).call(() => {
        this.particles.enabled = true;
      })
      .start();
  }

  hide() {
    this._isShowed = false;
    tween(this.opacity)
      .to(0.2, { opacity: 0 }, { easing: "quadOut" }).call(() => {
        this.particles.enabled = false;
      })
      .start();
  }
}
