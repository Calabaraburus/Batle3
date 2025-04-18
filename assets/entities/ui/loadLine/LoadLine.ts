//  LoadLine - ClbBlast
//
//  Calabaraburus (c) 2023
//
//  Author:Natalchishin Taras

import {
  _decorator,
  Component,
  Label,
  Sprite,
  Node,
  UITransform,
  Vec3, CCFloat,
  UIOpacity,
  assert
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("LoadLine")
export class LoadLine extends Component {
  loadLineRealLen: number;

  @property(Label)
  lblValue: Label;

  @property({ type: Node })
  loadLineNode: Node;

  @property(CCFloat)
  max = 100;
  public get Max(): number {
    return this.max;
  }

  public set Max(value: number) {
    this.max = value;
    this.updateLifeLinePos();
  }

  @property(CCFloat)
  min = 0;
  public get Min(): number {
    return this.min;
  }

  public set Min(value: number) {
    this.min = value;
    this.updateLifeLinePos();
  }

  value = 0;
  public get Value(): number {
    return this.value;
  }

  public set Value(value: number) {
    this.value = value;
    this.lblValue.string = value.toString();
    this.updateLifeLinePos();
  }

  start() {
    const transform = this.loadLineNode.getComponent(UITransform);
    if (transform == null) throw Error("Error geting line transform");

    this.loadLineRealLen = transform.contentSize.x;
  }

  private updateLifeLinePos() {
    const coef = this.loadLineRealLen / (this.max - this.min);

    this.loadLineNode.position = new Vec3(
      coef * (this.value - this.min),
      this.loadLineNode.position.y,
      this.loadLineNode.position.z
    );
  }

  show(show = true) {
    var opacity = this.getComponent(UIOpacity);

    assert(opacity != null);

    if (show) {
      opacity.opacity = 255;
    } else {
      opacity.opacity = 0;
    }
  }
}
