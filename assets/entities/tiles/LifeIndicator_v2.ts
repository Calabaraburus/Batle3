import {
    _decorator,
    __private,
    Component,
    CCInteger,
    Label
} from "cc";

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass("LifeIndicator_v2")
@executeInEditMode(true)
export class LifeIndicator_v2 extends Component {
    private _activeLifes: number;
    private _maxLifes: number;

    @property(Label)
    label: Label;

    @property(CCInteger)
    get activeLifes() {
        return this._activeLifes;
    }

    set activeLifes(value: number) {
        this._activeLifes = value;
        this.label.string = value.toString();
    }

    @property(CCInteger)
    get maxLifes() {
        return this._maxLifes;
    }

    set maxLifes(value: number) {
        this._maxLifes = value;
        this.node.active = value > 1;
    }

    start(): void {
        this.label.string = this._activeLifes.toString()
    }
}
