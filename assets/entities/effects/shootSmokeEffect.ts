import { ParticleSystem, _decorator } from "cc";
const { ccclass, property } = _decorator;
import { CardEffect } from "./CardEffect";

@ccclass("ShootSmokeEffect")
export class ShootSmokeEffect extends CardEffect {
  private _particles: ParticleSystem | null | undefined;
  private _angle: number;

  start() {
    this._particles = this.node
      .getChildByName("smoke")
      ?.getComponent(ParticleSystem);

    this.rotate(this._angle);
  }

  public rotate(a: number) {
    if (this._particles == null) {
      this._angle = a;
      return;
    }

    this._particles.startRotation3D = true;
    this._particles.startRotationZ.constantMin = a;
    this._particles.startRotationZ.constantMax = a;
  }
}
