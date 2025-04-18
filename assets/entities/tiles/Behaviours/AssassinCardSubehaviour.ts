import { tween } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { AudioManager } from "../../../soundsPlayer/AudioManager";
import { AssassinTileController } from "../AssassinTile/AssassinTileController";

export class AssassinCardSubehaviour extends CardsSubBehaviour {
  private _tilesToTransform: TileController[] = [];
  private _cache: ObjectsCache | null;
  private _soundEffect: AudioManager | null;
  protected lvlTile = "assassin";

  prepare(): boolean {
    this.parent.debug?.log("[assassin_card_sub] Start preparing.");

    const targetTile = this.parent.target as StdTileController;
    if (this.parent.cardService == null) return false;

    if (targetTile instanceof StdTileController) {
      if (
        targetTile.playerModel == this.parent.cardService?.getOponentModel()
      ) {
        return false;
      }
    } else {
      return false;
    }

    if (targetTile.tileModel.specialTile) return false;

    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 0.5;

    return true;
  }

  run(): boolean {
    this.parent.debug?.log("[assassin_card_sub] Starting run.");
    const targetTile = this.parent.target as StdTileController;

    const model = this.parent.field?.fieldModel.getTileModel(this.lvlTile);

    if (model == undefined) {
      this.parent.debug?.log(
        "[assassin_card_sub][error] assassin model is null. return false."
      );
      return false;
    }

    const pModel = this.parent.cardService?.getCurrentPlayerModel();

    if (pModel == undefined || pModel == null) {
      this.parent.debug?.log(
        "[assassin_card_sub][error] CurrentPlayerModel is null or undefined." +
        " return false."
      );
      return false;
    }

    // we need to change tiles in place
    // so there we need to destroy prev. tile
    targetTile.fakeDestroy();

    const tile = this.parent.field?.createTile({
      row: targetTile.row,
      col: targetTile.col,
      tileModel: model,
      playerModel: pModel,
      position: targetTile.node.position,
      putOnField: true,
    });

    this.parent.debug?.log("[assassin_card_sub] End run with true.");
    return true;
  }

  effect(): boolean {
    this.parent.debug?.log("[assassin_card_sub] Start effect.");

    const effect =
      this._cache?.getObjectByPrefabName<CardEffect>("explosion2Effect");

    if (effect == null) {
      return false;
    }

    effect.node.position = this.parent.target.node.position;
    effect.node.parent = this.parent.effectsNode;
    effect.play();

    this.parent.audioManager.playSoundEffect("assassin");

    const animator = tween(this);
    animator.delay(1).call(() => effect.cacheDestroy());

    animator.start();

    return true;
  }
}
