import { _decorator, Component, Node, CCString } from "cc";
import { Service } from "../services/Service";
import { DEBUG } from "cc/env";
const { ccclass, property } = _decorator;

@ccclass("Behaviour")
export class Behaviour extends Service {
  private _target: Component;
  private _isStoped: boolean;
  protected _inProcess: boolean;

  get isStoped(): boolean {
    return this._isStoped;
  }

  get inProcess(): boolean {
    return this._inProcess;
  }

  get target(): Component {
    return this._target;
  }
  set target(value: Component) {
    this._target = value;
  }

  @property(CCString)
  type = "";

  activateCondition(): boolean {
    return true;
  }

  activate(): void {
    this._isStoped = false;
  }

  run(): void {
    throw Error("not implemented method");
  }

  stop(): void {
    this._isStoped = true;
  }

  clone(): Behaviour {
    const result = new Behaviour();

    this.cloneInternal(result);

    return new (this.constructor as new () => this)();
  }

  protected cloneInternal(b: Behaviour) {
    b.type = this.type;
    b._target = this._target;
    b._inProcess = this._inProcess;
    b._isStoped = this._isStoped;
  }
}
