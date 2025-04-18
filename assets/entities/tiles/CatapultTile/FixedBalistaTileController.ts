
import {
    _decorator,
    Sprite,
    tween,
    Node,
    error,
    assert,
    UITransform,
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { IAttackable } from "../IAttackable";
import { CardService } from "../../services/CardService";
import { EffectsService } from "../../services/EffectsService";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { BalistaCardEffect } from "../../effects/BalistaCardEffect";
import { DataService } from "../../services/DataService";
import { LevelView } from "../../level/LevelView";
import { PlayerModel } from "../../../models/PlayerModel";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { Service } from "../../services/Service";
import { CatapultTileController } from "./CatapultTileController";

const { ccclass, property } = _decorator;

@ccclass("FixedBalistaTileController")
export class FixedBalistaTileController extends CatapultTileController {
    start(): void {
        this.isFixed = true;
        super.start();
    }
}
