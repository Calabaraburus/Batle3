import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";

export class TeleportCardSubehaviour extends CardsSubBehaviour {
  private _cache: ObjectsCache | null;
  private targetTile: TileController | null = null;
  private tileSecond: TileController | null = null;

  prepare(): boolean {
    if (this.targetTile == null) {
      this.targetTile = this.parent.target as StdTileController;
      const playerTag = this.parent.cardService.getPlayerTag();
      if (playerTag == null) return false;
      if (this.parent.cardService == null) return false;

      if (this.targetTile instanceof StdTileController) {
        if (
          this.targetTile.playerModel ==
          this.parent.cardService.getCurrentPlayerModel()
        ) {
          return false;
        }
      } else {
        return false;
      }
      return false;
    } else {
      this.tileSecond = this.parent.target as StdTileController;
      const playerTag = this.parent.cardService.getPlayerTag();
      if (playerTag == null) return false;
      if (this.parent.cardService == null) return false;

      if (this.tileSecond instanceof StdTileController) {
        if (this.tileSecond.tileModel.containsTag(playerTag)) {
          return false;
        }
      } else {
        return false;
      }

      this._cache = ObjectsCache.instance;
      this.effectDurationValue = 1;

      return true;
    }
  }

  run(): boolean {
    if (this.targetTile != null && this.tileSecond != null) {
      this.parent.field?.exchangeTiles(this.targetTile, this.tileSecond);
    }
    this.targetTile = null;
    this.tileSecond = null;

    return true;
  }

  effect(): boolean {
    this.parent.fieldViewController.moveTilesAnimate();

    this.parent.audioManager.playSoundEffect("teleport");

    return true;
  }
}
