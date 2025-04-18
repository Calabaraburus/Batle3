import { _decorator, assert, Component, Label, Node, UIOpacity } from 'cc';
import { access } from 'original-fs';
const { ccclass, property } = _decorator;

@ccclass('TaskInfo')
export class TaskInfo extends Component {

    @property(Label)
    allCountLbl: Label;

    @property(Label)
    dthCountLbl: Label;

    public getAllCount() {
        return Number(this.allCountLbl.string);
    }

    public getDthCount() {
        return Number(this.dthCountLbl.string);
    }

    public setAllCount(val: number) {
        this.allCountLbl.string = val.toString();
    }

    public setDthCount(val: number) {
        this.dthCountLbl.string = val.toString();
    }

    public reduceDthCount(val: number) {
        this.dthCountLbl.string = (this.getDthCount() - val).toString();
    }

    show(show = true) {
        const opacity = this.getComponent(UIOpacity);
        assert(opacity != null);

        if (show) {
            opacity.opacity = 255;
        } else {
            opacity.opacity = 0;
        }
    }

}


