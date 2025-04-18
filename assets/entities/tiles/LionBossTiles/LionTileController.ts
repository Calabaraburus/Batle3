import {
    _decorator,
    Sprite,
    tween,
    Node,
    error,
    assert,
    UITransform,
    Vec3,
    randomRangeInt,
    randomRange,
    random
} from "cc";
import { TileController } from "../TileController";
import { TileModel } from "../../../models/TileModel";
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
import { GameManager } from "../../game/GameManager";
import { ShootEffect } from "../../effects/ShootEffect";
import { FieldController } from "../../field/FieldController";
import { EffectsManager } from "../../game/EffectsManager";
import { CardEffect } from "../../effects/CardEffect";
import { NodeEventEmitter } from "electron";

const { ccclass, property } = _decorator;

@ccclass("LionTileController")
export class LionTileController
    extends TileController
    implements IAttackable {

    private _isMainTile = false;
    private _logicId = 0;

    //static modelMnemToSpriteId: Record<string, number> = { "l1": 0, "l2": 1, "l3": 2, "l4": 3 };

    static _lionTiles: LionTileController[] = [];
    static _groupNode: Node | null;

    _turnLogicList: (() => void)[] = [];
    private _cardService: CardService;
    private _effectsService: EffectsService;
    private _gameManager: GameManager;
    private _shootEffect: ShootEffect;
    private _effectsManager: EffectsManager;
    private _cache: ObjectsCache;
    private _groupNode: Node | null;

    private power = 3;
    private _fieldViewController: FieldController;
    private _audioService: AudioManagerService;

    start(): void {

        this.isFixed = true;

        if (LionTileController._lionTiles.length >= 4) {
            LionTileController._lionTiles = [];
            if (this._groupNode) this._groupNode.children.length = 0;
        }

        if (LionTileController._lionTiles.length == 0) {
            this._isMainTile = true;
            LionTileController._lionTiles = [];
            LionTileController._groupNode = new Node();
            LionTileController._groupNode.parent = this.node.parent;
            this.initTurnLogic();

            this.initServices();
        }

        this._groupNode = LionTileController._groupNode;

        LionTileController._lionTiles.push(this);
        this.node.parent = this._groupNode;

        // if (LionTileController._lionTiles.length >= 4) {
        //     const tiles = LionTileController._lionTiles;
        //     const mainPos = tiles[0].node.position.clone();
        //
        //     tiles.forEach(t => {
        //         t.node.position = t.node.position.subtract(mainPos);
        //     });
        // }

        super.start();
        this.setLionSprite();
    }

    initServices() {
        this._cardService = Service.getServiceOrThrow(CardService);
        this._effectsService = Service.getServiceOrThrow(EffectsService);
        this._gameManager = Service.getServiceOrThrow(GameManager);
        this._shootEffect = Service.getServiceOrThrow(ShootEffect);
        this._effectsManager = Service.getServiceOrThrow(EffectsManager);
        this._fieldViewController = Service.getServiceOrThrow(FieldController);
        this._audioService = Service.getServiceOrThrow(AudioManagerService);

        assert(ObjectsCache.instance != null, "Cache can't be null");

        this._cache = ObjectsCache.instance;
    }

    private initTurnLogic() {
        this._turnLogicList.push(() => this._effectsManager.PlayEffect(() => this.jumpLogic(), 2));
        this._turnLogicList.push(() => { });
        this._turnLogicList.push(() => this._effectsManager.PlayEffect(() => {
            const r = random();
            r < 0.8 ? this.fireAttackLogic() : this.jumpLogic();
        }, 2));
        this._turnLogicList.push(() => { });
    }

    jumpLogic() {

        if (this._groupNode == null) return;
        const p = this._groupNode.parent;
        this._groupNode.parent = null;
        this._groupNode.parent = p;

        const animHelper = new LionAnimationHelper(this._groupNode);

        let excludeArr: TileController[] = [];
        excludeArr = excludeArr.concat(LionTileController._lionTiles);
        const aim = this.selectAim(true, ...excludeArr);

        if (aim == null) return;

        excludeArr = excludeArr.concat(this.getAimTiles(aim));
        const aim2 = this.selectAim(false, ...excludeArr);

        if (aim2 == null) return;

        const startPos = animHelper.position.clone();
        const endPos = aim.node.position.clone();
        const endPos2 = aim2.node.position.clone();
        const midPos = startPos.clone().add(endPos.clone().subtract(startPos).multiplyScalar(0.5));
        const midPos2 = endPos.clone().add(endPos2.clone().subtract(endPos).multiplyScalar(0.5));

        const sizeOrig = this._groupNode.scale.clone();
        const sizeMid = sizeOrig.clone().multiplyScalar(1.5);

        tween(animHelper)
            .set({ position: startPos, scale: sizeOrig })
            .call(() => this._audioService.playSoundEffect("roar1"))
            .delay(0.3)
            .to(0.3, { position: midPos, scale: sizeMid }, { easing: "cubicOut" })
            .to(0.3, { position: endPos, scale: sizeOrig }, { easing: "cubicIn" })
            .call(() => {
                this._audioService.playSoundEffect("lexplosion1");
                this.destroy4Tiles(aim);
                this.crushEffect(endPos.clone().add(new Vec3(50, 50)));
            })
            .delay(0.3)
            .to(0.3, { position: midPos2, scale: sizeMid }, { easing: "cubicOut" })
            .to(0.3, { position: endPos2, scale: sizeOrig }, { easing: "cubicIn" })
            .call(() => {
                this._audioService.playSoundEffect("lexplosion1");
                const dTiles = this.destroy4Tiles(aim2);
                this.crushEffect(endPos2.clone().add(new Vec3(50, 50)));
                dTiles.forEach((dt, i) => {
                    const dt2 = LionTileController._lionTiles[i];
                    if (dt != dt2) this.fieldController.exchangeTiles(dt, dt2);
                });

                this.fieldController.moveTilesLogicaly(this._gameManager?.playerTurn);
                this.fieldController.fixTiles();

                this._fieldViewController.moveTilesAnimate();
            })
            .start();
    }

    fireAttackLogic() {

        if (this._groupNode == null) return;
        const p = this._groupNode.parent;
        this._groupNode.parent = null;
        this._groupNode.parent = p;

        const animHelper = new LionAnimationHelper(this._groupNode);

        let excludeArr: TileController[] = [];
        excludeArr = excludeArr.concat(LionTileController._lionTiles);
        const aim = this.selectAimForFireAttack()

        excludeArr = excludeArr.concat(this.getAimTiles(aim));
        const aim2 = this.selectAim(false, ...excludeArr);

        if (aim2 == null) return;

        const mainTile = LionTileController._lionTiles[0];
        const startPos = animHelper.position.clone();
        const endPos = aim.node.position.clone();
        const endPos2 = aim2.node.position.clone();
        const midPos = startPos.clone().add(endPos.clone().subtract(startPos).multiplyScalar(0.5));
        const midPos2 = endPos.clone().add(endPos2.clone().subtract(endPos).multiplyScalar(0.5));

        const sizeOrig = this._groupNode.scale.clone();
        const sizeMid = sizeOrig.clone().multiplyScalar(1.5);
        const lionTiles = LionTileController._lionTiles.map(t => <TileController>t);

        const tilesToDestroy = this.fieldController.fieldMatrix.filter(t => (t.col == mainTile.col || t.col == mainTile.col + 1) &&
            !t.tileModel.serviceTile && !lionTiles.includes(t) && t.row < mainTile.row);

        tween(animHelper)
            .set({ position: startPos, scale: sizeOrig })
            .call(() => this._audioService.playSoundEffect("roar1"))
            .delay(0.3)
            .call(() => {
                this._audioService.playSoundEffect("firewall");
                const effecttiles: TileController[] = [];
                effecttiles.push(...lionTiles);
                effecttiles.push(...tilesToDestroy);

                this.fireEffect(effecttiles);
            })
            .to(0.5, { position: endPos })
            .call(() => {
                tilesToDestroy.forEach(t => {
                    t.fakeDestroy();
                });
                this.getAimTiles(aim).forEach(t => {
                    if (!lionTiles.includes(t)) t.node.active = false;
                });
            })
            .delay(0.3)
            .to(0.3, { position: midPos2, scale: sizeMid }, { easing: "cubicOut" })
            .to(0.3, { position: endPos2, scale: sizeOrig }, { easing: "cubicIn" })
            .call(() => {
                this._audioService.playSoundEffect("lexplosion1");
                const dTiles = this.destroy4Tiles(aim2);
                this.crushEffect(endPos2.clone().add(new Vec3(50, 50)));
                dTiles.forEach((dt, i) => {
                    const dt2 = LionTileController._lionTiles[i];
                    if (dt != dt2) this.fieldController.exchangeTiles(dt, dt2);
                });

                this.fieldController.moveTilesLogicaly(this._gameManager?.playerTurn);
                this.fieldController.fixTiles();

                this._fieldViewController.moveTilesAnimate();
            })
            .start();
    }

    fireEffect(tiles: TileController[]) {
        const effects: CardEffect[] = [];
        const animator = tween(this);
        const lionTiles = LionTileController._lionTiles.map(t => <TileController>t);
        tiles.sort((t1, t2) => t2.row - t1.row);
        const addEffect = (t: TileController) => {
            const effect = this._cache?.getObjectByPrefabName<CardEffect>("firewallBlueEffect");
            if (!effect) return null;
            effect.node.position = t.node.position;
            effect.node.parent = this._effectsService.effectsNode;
            effect.stopEmmit();
            effects.push(effect);
            return effect;
        }

        for (let i = 0; i < tiles.length - 4; i += 2) {
            const t1 = tiles[i];
            const t2 = tiles[i + 1];

            const f1 = addEffect(t1);
            const f2 = addEffect(t2);

            animator.call(() => {
                f1?.play();
                f2?.play();
            }).delay(0.05);
        }

        for (let i = 0; i < effects.length; i += 2) {
            const t1 = tiles[i];
            const t2 = tiles[i + 1];
            const f1 = effects[i];
            const f2 = effects[i + 1];

            animator.call(() => {
                if (!lionTiles.includes(t1)) t1.node.active = false;
                if (!lionTiles.includes(t1)) t2.node.active = false;
                f1?.stopEmmit();
                f2?.stopEmmit();
            }).delay(0.05);
        }

        animator
            .delay(1)
            .call(() => effects.forEach(e => e.cacheDestroy())).start();

    }

    crushEffect(pos: Vec3) {
        const effects: CardEffect[] = [];

        for (let i = 0; i < 4; i++) {
            const effect = this._cache?.getObjectByPrefabName<CardEffect>("TilesCrushEffectForLion");
            if (!effect) continue;

            effect.node.setRotationFromEuler(new Vec3(0, 0, 90 * i));
            effect.node.parent = this._effectsService.effectsNode;
            effect.node.position = pos;
            effects.push(effect);

            effect.play();

        }

        tween(this).delay(2).call(() => {
            effects.forEach(e => {
                e.cacheDestroy();
            })
        });

    }

    destroy4Tiles(aim: TileController) {
        const res = this.getAimTiles(aim);

        res.forEach(tile => {
            if (!this.isLionTile(tile)) {
                tile.fakeDestroy();
                tile.node.active = false;
            }
        });

        return res;
    }

    getAimTiles(aim: TileController) {
        const idsVec = [[0, 0], [0, 1], [1, 0], [1, 1]];
        const res: TileController[] = [];
        idsVec.forEach(id => {
            const row = aim.row + id[0];
            const col = aim.col + id[1];

            const tile = this.fieldController.fieldMatrix.get(row, col);

            res.push(tile);
        });

        return res;
    }

    isLionTile(tile: TileController) {
        for (const lTile of LionTileController._lionTiles) {
            if (tile == lTile) return true;
        }

        return false;
    }

    selectAimForFireAttack() {
        const t = LionTileController._lionTiles[0];
        return this.fieldController.fieldMatrix.get(1, t.col);
    }

    selectAim(selectEnemy = true, ...exclude: TileController[]) {
        const tiles = this.fieldController.fieldMatrix
            .filter(t => (t.playerModel != null)
                &&
                (selectEnemy ?
                    (t.playerModel != this.playerModel) :
                    (t.playerModel == this.playerModel))
                &&
                (t.row > 1 && t.row < this.fieldController.fieldMatrix.rows - 2)
                &&
                (t.col > 0 && t.col < this.fieldController.fieldMatrix.cols - 1)
                &&
                !this.getAimTiles(t).some(t => exclude.includes(t)));

        return tiles.length <= 0 ? null : tiles[randomRangeInt(0, tiles.length)];
    }

    public setModel(tileModel: TileModel) {
        super.setModel(tileModel);

        if (this._backgroundSprite) this._backgroundSprite.node.active = false;

        this.setLionSprite();
    }

    setLionSprite() {
        if (!this._foregroundSprite) return;

        this._foregroundSprite.spriteFrame = this.tileModel.sprite;
    }

    attack(power: number): void {
        if (this._isMainTile) {
            if (this.playerModel) this.playerModel.life -= this.power;
            this.dataService.levelController.updateData();
        } else {
            LionTileController._lionTiles[0].attack(0);
        }
    }

    turnBegins(): void {
        if (!this._isMainTile) return;
        if (this._cardService?.getCurrentPlayerModel() == this.playerModel) return;

        this.invokeTurnLogic();
        this.incrementLogicId();
    }

    invokeTurnLogic() {
        this._turnLogicList[this._logicId]();
    }

    incrementLogicId() {
        this._logicId++;

        if (this._logicId >= this._turnLogicList.length) {
            this._logicId = 0;
        }
    }
}

class LionAnimationHelper {
    private _position: Vec3;
    private _scale: Vec3;
    private _tiles: LionTileController[];
    private _mainTile: LionTileController;
    private _group: Node;

    get position() {
        return this._mainTile.node.position;
    }

    set position(value: Vec3) {
        this._position = value;
        this.updatePosition();
    }

    get scale() {
        return this._scale;
    }

    set scale(value: Vec3) {
        this._scale = value;
        this.updateScale();
    }

    constructor(group: Node) {
        this._tiles = LionTileController._lionTiles;
        this._mainTile = this._tiles[0];
        this._group = group;
    }

    updatePosition() {
        const mainPos = this._mainTile.node.position.clone();

        this._tiles.forEach(t => {
            t.node.position.subtract(mainPos);
            t.node.position = t.node.position.add(this._position);
        });
    }

    updateScale() {

        this._group.scale = this._scale;
    }
}
