//  MineTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2023
//
//  Author:Natalchishin Taras
//  StdTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { CCInteger, _decorator, assert, tween } from "cc";
import { TileController } from "../TileController";
import { CardService } from "../../services/CardService";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { EffectsService } from "../../services/EffectsService";
import { GameManager } from "../../game/GameManager";
import { IAttackable, isIAttackable } from "../IAttackable";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { Service } from "../../services/Service";
import { FieldController } from "../../field/FieldController";
import { EffectsManager } from "../../game/EffectsManager";
const { ccclass, property } = _decorator;

@ccclass("MineTileController")
export class MineTileController extends TileController {
  @property(CCInteger)
  lvl = 2;

  private _cardService: CardService;
  private _effectsService: EffectsService;
  private _cache: ObjectsCache;
  private _gameManager: GameManager;
  private _fieldViewController: FieldController;
  private _effectsManager: EffectsManager;

  start() {
    super.start();
    this.attackPower = 0;

    this._cardService = Service.getServiceOrThrow(CardService);
    this._effectsService = Service.getServiceOrThrow(EffectsService);
    this._gameManager = Service.getServiceOrThrow(GameManager);
    this._fieldViewController = Service.getServiceOrThrow(FieldController);
    this._effectsManager = Service.getServiceOrThrow(EffectsManager);

    assert(ObjectsCache.instance != null, "ObjectsCache can't be null");

    this._cache = ObjectsCache.instance;
  }

  turnEnds(): void {
    if (this._cardService?.getOponentModel() == this.playerModel) {
      this._effectsManager.PlayEffectNow(() => this.playEffect(), 0.8);
      Service.getService(AudioManagerService)?.playSoundEffect("mine_attack");
      this.fakeDestroy();
      this.node.active = false;

      let coordTiles: number[][];

      if (this.lvl === 2) {
        coordTiles = [
          [-1, 0],
          [0, -1],
          [1, 0],
          [0, 1],
        ];
      } else if (this.lvl === 1) {
        coordTiles = [
          [0, -1],
          [0, 1],
        ];
      } else {
        console.error("Неподдерживаемый уровень (lvl):", this.lvl);
        coordTiles = [];
      }

      coordTiles.forEach((coords) => {
        const tile = this.fieldController.fieldMatrix.get(
          this.row + coords[0],
          this.col + coords[1]
        );
        if (isIAttackable(tile)) {
          (<IAttackable>tile).attack(1);
        } else {
          this.destroyOtherTile(this.row + coords[0], this.col + coords[1]);
        }
      });

      this.fieldController.moveTilesLogicaly(this._gameManager?.playerTurn);
      this.fieldController.fixTiles();
    }
  }

  private destroyOtherTile(row: number, col: number) {

    // destroyTile won't destroy spectiles without setting destroyServiceTile to true
    var tile = this.fieldController.destroyTile(row, col, (t) => {
      return t.playerModel !== this.playerModel;
    });

    if (tile) tile.node.active = false;
  }

  playEffect() {
    const effect =
      this._cache?.getObjectByPrefabName<CardEffect>("explosionEffect");

    if (effect != null) {
      effect.node.position = this.node.position;
      effect.node.parent =
        this._effectsService != null ? this._effectsService?.effectsNode : null;
      effect.play();

      const timeObj = { time: 0 };
      const animator = tween(timeObj);

      animator
        .delay(0.5)
        .call(() => this._fieldViewController.moveTilesAnimate())
        .delay(0.3)
        .call(() => effect.stopEmmit())
        .delay(5)
        .call(() => effect.cacheDestroy());

      animator.start();
    }
  }
}
