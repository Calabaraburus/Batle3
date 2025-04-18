//  MineTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2023
//

import {
  _decorator,
  Sprite,
  Vec3,
  instantiate,
  Prefab,
  UITransform,
  randomRangeInt,
  tween,
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
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { Service } from "../../services/Service";
import { DataService } from "../../services/DataService";
import { EffectsManager } from "../../game/EffectsManager";
const { ccclass, property } = _decorator;

@ccclass("BerserkTileController")
export class BerserkTileController
  extends TileController
  implements IAttackable {
  private _cardService: CardService;
  private _state: TileState;
  private _attacksCountToDestroy: number;
  private _attackedNumber: number;
  private _gameManager: GameManager;

  /** Destroy particle system */
  @property(Prefab)
  destroyPartycles: Prefab;
  maxCount: number;
  //_tilesToDestroy: TileController[] | undefined;
  private _dataService: DataService;
  _fieldViewController: FieldController;
  private _effectsManager: EffectsManager;
  private _audio: AudioManagerService;

  get attacksCountToDestroy() {
    return this._attacksCountToDestroy;
  }

  start() {
    super.start();
    this._cardService = Service.getServiceOrThrow(CardService);
    this._dataService = Service.getServiceOrThrow(DataService);
    this._gameManager = Service.getServiceOrThrow(GameManager);
    this._fieldViewController = Service.getServiceOrThrow(FieldController);
    this._effectsManager = Service.getServiceOrThrow(EffectsManager);
    this._audio = Service.getServiceOrThrow(AudioManagerService);
    this.updateSprite();
  }

  turnBegins(): void {
    if (this._cardService?.getCurrentPlayerModel() != this.playerModel) {


      this.maxCount = 1;

      const matrix = this.fieldController.fieldMatrix;
      let vectorAttack = 1;

      if (this.playerModel == this._dataService.botModel) {
        vectorAttack = -1;
      }
      const aimTile = matrix.get(this.row + vectorAttack, this.col);

      if (!aimTile) {
        return;
      }

      this._effectsManager.PlayEffectNow(() => this.playEffect(aimTile), 0.6);

      if (aimTile.playerModel == this.playerModel) {
        this.exchangeTile(aimTile);
      } else {
        this.destroyAimTile(aimTile);
      }

      this.fieldController.moveTilesLogicaly(this._gameManager.playerTurn);
      this.fieldController.fixTiles();
    }
  }

  destroyAimTile(aimTile: TileController) {
    const tilesToDestroy: TileController[] = [];

    tilesToDestroy.push(aimTile);

    tilesToDestroy.forEach((t) => {
      if (isIAttackable(t)) {
        (<IAttackable>t).attack(1);
      } else {

        if (t.playerModel != this.playerModel && !t.tileModel.serviceTile) {
          t.fakeDestroy();
          t.node.active = false;
        }
      }
    });
  }

  exchangeTile(aimTile: TileController) {
    this.fieldController.exchangeTiles(aimTile, this);
  }

  public get state(): TileState {
    return this._state;
  }

  public setModel(tileModel: TileModel) {
    super.setModel(tileModel);

    this._attacksCountToDestroy = 1;

    this._attackedNumber = this.attacksCountToDestroy;
  }

  public cacheCreate(): void {
    super.cacheCreate();

    this._attackedNumber = this.attacksCountToDestroy;
  }

  /** Attack this enemy with power.
   * @power Power.
   */
  public attack(power = 1) {
    if (this._attackedNumber > 0) {
      this._attackedNumber -= power;

      if (this._attackedNumber <= 0) {
        this.fakeDestroy();
        this.node.active = false;
      }
    }
  }

  playEffect(aimTile: TileController) {
    console.log("berserk effect");

    const timeObj = { time: 0 };
    const animator = tween(timeObj);

    if (aimTile.playerModel != this.playerModel && aimTile.playerModel != null) {
      this._audio.playSoundEffect(
        "berserk_attack"
      );
    }

    animator
      .delay(0.2)
      .call(() => this._fieldViewController.moveTilesAnimate());

    animator.start();
    return true;
  }
}
