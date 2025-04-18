import { Behaviour } from "../../behaviours/Behaviour";
import { CardsBehaviour } from "./CardsBehaviour";
import { ISubBehaviour } from "./ISubBehaviour";

export class CardsSubBehaviour implements ISubBehaviour {
  private _mainBehave: CardsBehaviour;
  protected effectDurationValue = 1;
  public get effectDuration(): number {
    return this.effectDurationValue;
  }

  public get parent(): CardsBehaviour {
    return this._mainBehave;
  }

  public set parent(value: CardsBehaviour) {
    this._mainBehave = value;
  }

  constructor(mainBehaviour: CardsBehaviour) {
    this._mainBehave = mainBehaviour;
  }

  prepare(): boolean {
    return true;
  }
  select(): boolean {
    return true;
  }
  run(): boolean {
    return true;
  }
  effect(): boolean {
    return true;
  }

  public clone() {
    const clone = Object.create(this);;
    return clone;
  }
}
