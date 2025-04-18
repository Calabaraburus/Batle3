import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";

export class RecruitEnemyCardSubehaviour extends CardsSubBehaviour {
  private _tilesToRecruit: TileController[] = [];
  private _cache: ObjectsCache | null;
  private countForEachSide = 1;

  prepare(): boolean {
    let rnd_const = 0;
    const targetTile = this.parent.target as StdTileController;
    const playerTag = this.parent.cardService.getPlayerTag();
    const matrix = this.parent.field?.fieldMatrix;
    if (playerTag == null) return false;
    if (this.parent.cardService == null) return false;

    if (!matrix) return false;
    if (
      matrix.get(targetTile.row - 1, targetTile.col).tileModel.getTags() ==
      targetTile.tileModel.getTags()
    )
      return false;
    if (targetTile instanceof StdTileController) {
      if (targetTile.tileModel.containsTag(playerTag)) {
        return false;
      }
    } else {
      return false;
    }

    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 1;
    this._tilesToRecruit = [];
    const currentTile: TileController = targetTile;

    this._tilesToRecruit.push(currentTile);

    matrix.forEachCol(targetTile.col, (tile) => {
      if (this.parent.cardService == null) return;
      if (
        tile.tileModel.containsTag(this.parent.cardService.getOponentTag())
      ) {
        const rnd = Math.floor(Math.random() * 2);
        if (rnd == 0 && rnd_const == 0) {
          this._tilesToRecruit.push(tile);
        } else rnd_const = 1;
      }
    });

    return true;
  }

  run(): boolean {
    const pModel = this.parent.cardService.getCurrentPlayerModel();

    if (pModel == undefined || pModel == null) {
      this.parent.debug?.log(
        "[card_sub][error] CurrentPlayerModel is null or undefined." +
        " return false."
      );
      return false;
    }

    this._tilesToRecruit.forEach((tile) => {
      const tModel = this.parent.field?.fieldModel.getTileModel(
        tile.tileModel.tileName
      );

      if (tModel == undefined) {
        this.parent.debug?.log(
          "[card_sub][error] TileModel is undefined." + " return false."
        );
        return false;
      }

      tile.fakeDestroy();

      this.parent.field?.createTile({
        row: tile.row,
        col: tile.col,
        tileModel: tModel,
        playerModel: pModel,
        position: tile.node.position,
        putOnField: true,
      });
    });

    return true;
  }

  effect(): boolean {
    this.parent.fieldViewController.moveTilesAnimate();

    return true;
  }
}
