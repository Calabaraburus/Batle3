
import {
    _decorator,
    Sprite,
    Vec3,
    instantiate,
    Prefab,
    UITransform,
    randomRangeInt,
    tween,
    Vec2,
    Quat,
    assert,
    CCInteger,
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
import { TileState } from "../TileState";
import { IAttackable, isIAttackable } from "../IAttackable";
import { GameManager } from "../../game/GameManager";
import { CardService } from "../../services/CardService";
import { PlayerModel } from "../../../models/PlayerModel";
import { FieldController } from "../../field/FieldController";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { EffectsService } from "../../services/EffectsService";
import { ShootEffect } from "../../effects/ShootEffect";
import { Line } from "../../effects/Line";
import { ShootSmokeEffect } from "../../effects/shootSmokeEffect";
import { Service } from "../../services/Service";
const { ccclass, property } = _decorator;


@ccclass("WallTileController")
export class WallTileController extends TileController implements IAttackable {

    @property(Prefab)
    destroyPartycles: Prefab;

    @property(CCInteger)
    life = 3;

    private _lifeOp = 0;

    start(): void {
        super.start();
        this.isFixed = true;
        this._lifeOp = this.life;

    }

    attack(power: number): void {
        if (this._lifeOp <= 0) return;

        this._lifeOp -= power;

        if (this._lifeOp < 3 && this._lifeOp > 1) {
            this._foregroundSprite!.spriteFrame = this.tileModel.additionalSprites[0].sprite;
        } else if (this._lifeOp < 2) {
            this._foregroundSprite!.spriteFrame = this.tileModel.additionalSprites[1].sprite;
        } else { }

        if (this._lifeOp <= 0) {
            this.fakeDestroy();
            this.node.active = false;
        }
    }



    private createParticles() {
        const ps = instantiate(this.destroyPartycles);

        ps.parent = this.node.parent;
        const ui = this.getComponent(UITransform);

        if (ui == null) {
            return;
        }

        ps.position = new Vec3(
            this.node.position.x + ui.contentSize.width / 2,
            this.node.position.y + ui.contentSize.height / 2,
            this.node.position.z
        );
    }
}
