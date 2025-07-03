import { assert, randomRangeInt, tween } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { CardEffect } from "../../effects/CardEffect";
import { TileModel } from "../../../models/TileModel";

export class CatapultCardSubehaviour extends CardsSubBehaviour {
  private _tilesToTransform: TileController[] = [];
  private _cache: ObjectsCache | null;
  private _catapultModel: TileModel;
  protected lvlTile = "catapult";

  prepare(): boolean {
    this.parent.debug?.log("[catapult_card_sub] Start preparing.");

    const targetTile = this.parent.target as StdTileController;

    if (this.parent.cardService == null) return false;

    if (targetTile instanceof StdTileController) {
      if (targetTile.playerModel == this.parent.cardService.getOponentModel()) {
        return false;
      }
    } else {
      return false;
    }

    if (targetTile.tileModel.specialTile) return false;

    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 0.4;

    this.parent.debug?.log("[catapult_card_sub] Stop preparing with.");
    return true;
  }

  run(): boolean {
    this.parent.debug?.log("[catapult_card_sub] Starting run.");

    assert(this.parent.currentPlayerModel != null);

    const targetTile = this.parent.target as StdTileController;

    const model = this.parent.field.fieldModel.getTileModel(this.lvlTile);

    targetTile.fakeDestroy();

    this.parent.field.createTile({
      row: targetTile.row,
      col: targetTile.col,
      tileModel: model,
      playerModel: this.parent.currentPlayerModel,
      position: targetTile.node.position,
      putOnField: true,
    });

    this.parent.debug?.log("[catapult_card_sub] End run with true.");
    return true;
  }

  effect(): boolean {
    const effect =
      this._cache?.getObjectByPrefabName<CardEffect>("explosion2Effect");

    if (effect == null) {
      return false;
    }

    effect.node.position = this.parent.target.node.position;
    effect.node.parent = this.parent.effectsNode;
    effect.play();

    this.parent.audioManager.playSoundEffect("catapult");

    const animator = tween(this);
    animator.delay(1).call(() => effect.cacheDestroy());

    animator.start();
    return true;
  }
}
