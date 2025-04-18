import { randomRangeInt, tween } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { AudioManager } from "../../../soundsPlayer/AudioManager";
import { ReadonlyMatrix2D } from "../../field/ReadonlyMatrix2D";

export class PanicCardSubehaviour extends CardsSubBehaviour {
  private _tilesToPanic: TileController[] = [];
  private _cache: ObjectsCache | null;
  protected powerCard = 1;
  private _targetTile: StdTileController;
  private _soundEffect: AudioManager | null;

  prepare(): boolean {
    this._targetTile = this.parent.target as StdTileController;

    if (this._targetTile instanceof StdTileController) {
      if (
        this._targetTile.playerModel ==
        this.parent.currentPlayerModel ||
        this._targetTile.tileModel.specialTile
      ) {
        return false;
      }
    } else {
      return false;
    }

    this._cache = ObjectsCache.instance;
    this._tilesToPanic = [];

    const cords = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    cords.forEach((cord) => {
      const x = this._targetTile.row + cord[0];
      const y = this._targetTile.col + cord[1];

      const tile = this.parent.field.fieldMatrix.getSafe(x, y);
      if (tile instanceof StdTileController &&
        !tile.shieldIsActivated &&
        tile.playerModel == this._targetTile.playerModel &&
        !tile.tileModel.serviceTile) {
        this._tilesToPanic.push(tile);
      }
    });

    return true;
  }

  run(): boolean {
    this.parent.debug?.log("[panic_card_sub] Starting run.");

    this._tilesToPanic.forEach((t) => {
      if (t.tileModel != this._targetTile.tileModel) {
        t.fakeDestroy();

        this.parent.field?.createTile({
          row: t.row,
          col: t.col,
          tileModel: this._targetTile.tileModel,
          playerModel: this._targetTile.playerModel,
          position: t.node.position,
          putOnField: true,
        });
      }
    });

    this.parent.debug?.log("[panic_card_sub] End run with true.");
    return true;
  }

  effect(): boolean {
    this.parent.fieldViewController.moveTilesAnimate();
    this.parent.audioManager.playSoundEffect("panic");

    const timeObj = { time: 0 };
    const animator = tween(timeObj);
    const effects: CardEffect[] = [];

    this._tilesToPanic.forEach((t, i) => {

      animator.call(() => {
        const effect =
          this._cache?.getObjectByPrefabName<CardEffect>("panicEffect");
        if (effect == null) {
          return;
        }

        effect.node.position = t.node.position;
        effect.node.parent = this.parent.effectsNode;
        effect.play();

        effects.push(effect);
      });
    });

    animator
      .delay(0.8)
      .call(() => effects.forEach((e) => e.stopEmmit()))
      .delay(3)
      .call(() => effects.forEach((e) => e.cacheDestroy()));

    animator.start();

    return true;
  }
}
