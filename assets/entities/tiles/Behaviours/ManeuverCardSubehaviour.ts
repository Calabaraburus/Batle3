import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { TileModel } from "../../../models/TileModel";
import { AudioManager } from "../../../soundsPlayer/AudioManager";
import { AnimationEffect } from "../../effects/AnimationEffect";
import { EnemyFieldController } from "../../enemyField/EnemyFieldController";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";

export class ManeuverCardSubehaviour extends CardsSubBehaviour {
  private _tilesToManeuv: TileController[] = [];
  private _cache: ObjectsCache | null;
  private _targetTile: StdTileController;
  private _soundEffect: AudioManager | null;
  private _tileModels: TileModel[];

  prepare(): boolean {
    this._targetTile = this.parent.target as StdTileController;

    if (this._targetTile instanceof StdTileController) {
      if (
        this._targetTile.playerModel ==
        this.parent.cardService.getOponentModel()
      ) {
        return false;
      }
    } else {
      return false;
    }

    this._cache = ObjectsCache.instance;
    this._tilesToManeuv = [];

    this.fillModels(this._targetTile.tileModel);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const r = this._targetTile.row + i;
        const c = this._targetTile.col + j;
        const tile = this.parent.field.fieldMatrix.getSafe(r, c);

        if (tile &&
          !tile.tileModel.specialTile) {
          this._tilesToManeuv.push(tile);
        }
      }
    }

    return true;
  }

  fillModels(targetModel: TileModel) {
    const fieldModel = this.parent.field.fieldModel;
    const basetag =
      targetModel.containsTag("player") ? "player" :
        targetModel.containsTag("enemy") ? "enemy" :
          ""
    this._tileModels = fieldModel.getTileModelsByTags("player", "enemy")
      .filter(m => targetModel != m && m.containsTag(basetag));
  }

  run(): boolean {
    this.parent.debug?.log("[maneuver_card_sub] Starting run.");

    this._targetTile.tileModel

    let k = 0;

    this._tilesToManeuv.forEach(t => {
      if (t != this._targetTile &&
        t.playerModel == this.parent.currentPlayerModel) {

        if (t instanceof StdTileController && t.shieldIsActivated) {
          return;
        }

        t.fakeDestroy();

        this.parent.field.createTile({
          row: t.row,
          col: t.col,
          tileModel: this._tileModels[k],
          playerModel: t.playerModel,
          position: t.node.position,
          putOnField: true,
        });
      }

      if (++k >= this._tileModels.length) {
        k = 0;
      }
    });

    this.parent.debug?.log("[maneuver_card_sub] End run with true.");
    return true;
  }

  effect(): boolean {
    this.parent.debug?.log("[maneuver_card_sub] Start effect.");

    this.parent.audioManager.playSoundEffect("maneuver");

    this._tilesToManeuv.forEach((tile) => {

      if (tile.playerModel == this.parent.currentOponentModel) {
        return;
      }

      if (tile instanceof StdTileController && tile.shieldIsActivated) {
        return;
      }

      const effect =
        this._cache?.getObjectByPrefabName<AnimationEffect>("maneuverEffect");

      if (effect == null) {
        return false;
      }

      effect.node.parent = null;
      effect.node.parent = tile.node.parent;
      effect.node.position = tile.node.position;
      effect.node.scale = tile.node.scale;
      effect.play();
    });

    return true;
  }
}
