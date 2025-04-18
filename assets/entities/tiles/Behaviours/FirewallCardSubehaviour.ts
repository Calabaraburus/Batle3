//  fireWallCard - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { tween } from "cc";
import { ObjectsCache } from "../../../ObjectsCache/ObjectsCache";
import { CardEffect } from "../../effects/CardEffect";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { IAttackable, isIAttackable } from "../IAttackable";

export class FirewallCardSubehaviour extends CardsSubBehaviour {
  private _tilesToDestroy: TileController[] = [];
  private _cache: ObjectsCache | null;
  protected maxCountForEachSide = 3;

  prepare(): boolean {
    const targetTile = this.parent.target as StdTileController;

    if (targetTile instanceof StdTileController) {
      if (
        targetTile.playerModel == this.parent.currentPlayerModel
      ) {
        return false;
      }
    } else {
      return false;
    }

    this._cache = ObjectsCache.instance;
    this.effectDurationValue = 1;
    this._tilesToDestroy = [];

    this.parent.field.fieldMatrix.forEachCol(targetTile.col, (tile, rowId) => {
      if (
        tile.playerModel == this.parent.cardService.getOponentModel() &&
        !tile.tileModel.serviceTile
      ) {
        if (
          targetTile.row + this.maxCountForEachSide >= rowId &&
          targetTile.row - this.maxCountForEachSide <= rowId
        ) {
          this._tilesToDestroy.push(tile);
        }
      }
    });

    return true;
  }

  run(): boolean {
    this._tilesToDestroy.forEach((tile) => {
      if (isIAttackable(tile)) {
        (<IAttackable>tile).attack(1);
      } else {
        tile.fakeDestroy();
      }
    });

    return true;
  }

  effect(): boolean {
    console.log("fire wall effect");
    const timeObj = { time: 0 };
    const animator = tween(timeObj);
    const effects: CardEffect[] = [];
    this.parent.audioManager.playSoundEffect("firewall");
    this._tilesToDestroy.forEach((t, i) => {
      const time = 0.1;
      animator.delay(i == 0 ? 0 : time).call(() => {
        const effect =
          this._cache?.getObjectByPrefabName<CardEffect>("firewallEffect");
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
      .delay(0.5)
      .call(() => effects.forEach((e) => e.stopEmmit()))
      .delay(5)
      .call(() => effects.forEach((e) => e.cacheDestroy()));

    animator.start();
    return true;
  }
}
