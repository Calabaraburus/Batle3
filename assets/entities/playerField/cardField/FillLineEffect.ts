import {
    _decorator,
    Sprite,
    Label,
    Button,
    tween,
    Vec3,
    Node,
    UITransform,
    assert,
    Component,
} from "cc";
import { BonusModel } from "../../../models/BonusModel";
import { LevelModel } from "../../../models/LevelModel";
import { Service } from "../../services/Service";
import { CardFieldController } from "./CardFieldController";
import { WindowManager } from "../../infoPanel/WindowManager";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
const { ccclass, property, executeInEditMode } = _decorator;


@ccclass("FillLineEffect")
@executeInEditMode(true)
export class FillLineEffect extends Component {
    protected update(dt: number): void {

    }
}
