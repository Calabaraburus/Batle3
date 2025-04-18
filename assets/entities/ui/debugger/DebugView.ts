import { _decorator, Component, Node, Label, debug, RichText, RenderTexture, CCInteger } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DebugView")
export class DebugView extends Component {
  static _instance: DebugView;
  private _text = "";

  @property(RichText)
  debugLabel: RichText;

  @property(CCInteger)
  maxLines: number;

  static get instance(): DebugView {
    return this._instance;
  }

  start() {
    DebugView._instance = this;

    const origConsoleLog = console.log;

    console.log = (m) => {
      origConsoleLog(m);

      if (this._text.length > this.maxLines) {
        this._text = "";
      }
      this._text += m + "\n";
    };
  }

  public log(value: string) {
    console.log(value);
  }

  public showDebugText() {
    this.debugLabel.string = this._text;
  }
}
