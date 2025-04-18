import { _decorator, Component, Label, Node, SpringJoint2D, Sprite, EventTarget, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ComboRow')
export class ComboRow extends Component {

    private _ico: SpriteFrame;
    private _txt: string;

    public clickedEvent: EventTarget = new EventTarget();

    @property(Label)
    label: Label;

    @property(Sprite)
    sprite: Sprite;

    id: string;

    get ico() {
        return this._ico;
    }

    set ico(value: SpriteFrame) {
        this._ico = value;
        this.sprite.spriteFrame = value;
    }

    get txt() {
        return this._txt;
    }

    set txt(value: string) {
        this._txt = value;
        this.label.string = value;
    }

    protected start(): void {
        this.label.string = this._txt;
        this.sprite.spriteFrame = this._ico;
    }

    public OnClicked() {
        this.clickedEvent.emit("ComboRow", this);
    }
}


