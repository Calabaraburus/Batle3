import { _decorator, assert, Component, Label, Node } from 'cc';
import { GAME_VERSION } from '../../../globals/globals';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('VersionLbl')
@executeInEditMode(true)
export class VersionLbl extends Component {
    start() {
        var lbl = this.getComponent(Label);
        assert(lbl != null);

        lbl.string = "ver. " + GAME_VERSION;
    }
}


