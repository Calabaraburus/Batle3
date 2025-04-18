//  BodyExchangeCardSubehaviour.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { randomRangeInt, tween } from "cc";
import { TileModel } from "../../../models/TileModel";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";

export class BodyExchangeCardSubehaviour extends CardsSubBehaviour {
  private _tileModels: TileModel[] | undefined;

  prepare(): boolean {
    this.effectDurationValue = 1.8;
    const playerTag = this.parent.cardService.getPlayerTag();
    if (playerTag == null) return false;
    if (this.parent.cardService == null) return false;
    if (this.parent.target instanceof StdTileController) {
      if (this.parent.target.tileModel.containsTag(playerTag)) {
        return false;
      }
    } else {
      return false;
    }

    const targetTile = this.parent.target as StdTileController;

    this._tileModels = this.parent.dataService?.field?.fieldModel
      .getTileModelsByTags(this.parent.cardService.getOponentTag())
      .filter(
        (tm) =>
          tm.specialTile == false && tm.tileId != targetTile.tileModel.tileId
      );
    return true;
  }

  run(): boolean {
    if (this._tileModels == undefined) {
      return false;
    }

    const targetTile = this.parent.target as StdTileController;

    targetTile.setModel(
      this._tileModels[randomRangeInt(0, this._tileModels.length)]
    );

    return true;
  }

  effect(): boolean {
    return true;
  }
}
