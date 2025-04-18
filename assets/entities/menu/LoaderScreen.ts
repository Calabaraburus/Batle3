import {
  _decorator,
  Component,
  director,
  find,
  Tween,
  tween,
  UIOpacity,
  Vec3,
  Node,
  EventTarget,
  Label,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("LoaderScreen")
export class LoaderScreen extends Component {
  private _opacity: UIOpacity | null;
  private readonly timeToShow = 0.3;
  private showTween: Tween<UIOpacity | null>;
  private hideTween: Tween<UIOpacity | null>;
  private _isShowed = false;
  public readonly wndIsShowedEvent: EventTarget = new EventTarget();
  public readonly wndIsHidedEvent: EventTarget = new EventTarget();
  private _isShowing: boolean;
  private _isHiding: boolean;

  @property(Node)
  loaderNode: Node;

  @property(Label)
  errorTxt: Label;


  public get isShowed() {
    return this._isShowed;
  }

  public get isShowing() {
    return this._isShowing;
  }

  public get isHiding() {
    return this._isHiding;
  }


  start() {
    this._opacity = this.loaderNode.getComponent(UIOpacity);

    this.node.active = false;

    this.showTween = tween(this._opacity)
      .set({ opacity: 0 })
      .to(this.timeToShow, { opacity: 255 }, { easing: "linear" })
      .call(() => {
        this._isShowed = true;
        this._isShowing = false;
        this.wndIsShowedEvent.emit("wndIsShowed", this);
      });

    this.hideTween = tween(this._opacity).delay(1).call(() => {
      this.showTween.stop();
    })
      .to(this.timeToShow, { opacity: 0 }, { easing: "linear" })
      .call(() => {
        this.node.active = false;
        this._isShowed = false;
        this._isHiding = false;
      });
  }

  show() {
    if (this.isShowing) return;

    this._isShowing = true;
    this._isHiding = false;

    this.hideTween.stop();
    this.node.active = true;
    this.showTween.start();
  }

  hide() {
    if (this.isHiding) return;

    this._isShowing = false;
    this._isHiding = true;
    this.showTween.stop();
    this.hideTween.start();
  }
}
