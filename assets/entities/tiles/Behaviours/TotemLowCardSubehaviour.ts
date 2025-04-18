import { TotemCardSubehaviour } from "./TotemCardSubehaviour";

export class TotemLowCardSubehaviour extends TotemCardSubehaviour {
  protected tileModelMnem = "totemLow";
  prepare(): boolean {
    this._totemCount = 2
    return super.prepare();
  }
}
