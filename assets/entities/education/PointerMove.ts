import { _decorator, Component, Node, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PointerMove")
export class PointerMove extends Component {
  @property(Node)
  PoiterUp: Node;

  @property(Node)
  PoiterDown: Node;

  @property(Node)
  PoiterRight: Node;

  start() {
    this.moveDownUp();
    this.moveUpDown();
    this.moveLeftRight();
  }

  moveDownUp() {
    tween(this.PoiterUp)
      .repeatForever(
        tween()
          .to(0.8, { position: new Vec3(0, 358, 0) })
          .to(0.8, { position: new Vec3(0, 338, 0) })
      )
      .start();
  }

  moveUpDown() {
    tween(this.PoiterDown)
      .repeatForever(
        tween()
          .to(0.8, { position: new Vec3(0, -366, 0) })
          .to(0.8, { position: new Vec3(0, -346, 0) })
      )
      .start();
  }

  moveLeftRight() {
    tween(this.PoiterRight)
      .repeatForever(
        tween()
          .to(0.8, { position: new Vec3(176, -1060, 0) })
          .to(0.8, { position: new Vec3(156, -1060, 0) })
      )
      .start();
  }
}
