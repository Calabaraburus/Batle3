//  fireWallCard - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { randomRangeInt, tween, Vec2 } from "cc";
import { lightning } from "../../effects/lightning";
import { Line } from "../../effects/Line";
import { FieldController } from "../../field/FieldController";
import { CardService } from "../../services/CardService";
import { IAttackable, isIAttackable } from "../IAttackable";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { CardsSubBehaviour } from "./SubBehaviour";
import { ITileFieldController } from "../../field/ITileFieldController";

export class LightningCardSubehaviour extends CardsSubBehaviour {
  protected maxCount = 11;
  private _tilesToDestroy: TileController[] | undefined;
  private _cardsService: CardService | null;
  private _field: ITileFieldController | null | undefined;
  private _lightning: lightning | null;

  prepare(): boolean {
    const targetTile = this.parent.target as StdTileController;
    const playerTag = this.parent.cardService.getPlayerTag();
    if (playerTag == null) return false;
    if (this.parent.cardService == null) return false;

    if (targetTile instanceof StdTileController) {
      if (
        targetTile.playerModel ==
        this.parent.cardService.getCurrentPlayerModel()
      ) {
        return false;
      }
    } else {
      return false;
    }

    this.effectDurationValue = 1.5;
    this._cardsService = this.parent.cardService;
    this._field = this.parent.field;

    if (this._cardsService == null) return false;
    if (this._field == null) return false;
    this._tilesToDestroy = [];

    const oponentModel = this._cardsService.getOponentModel();

    const oponentTiles = this._field.fieldMatrix.filter((tile) => {
      return tile.playerModel == oponentModel && !tile.tileModel.serviceTile;
    });

    for (let index = 0; index < this.maxCount; index++) {
      this._tilesToDestroy.push(
        oponentTiles[randomRangeInt(0, oponentTiles.length)]
      );
    }

    return true;
  }

  run(): boolean {
    if (this._tilesToDestroy == undefined) return false;
    if (this._field == null) return false;

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
    this._lightning = this.parent.getService(lightning);

    if (this._lightning == null) return false;
    if (this._tilesToDestroy == undefined) return false;

    const vec: Line[] = [];

    let prev: TileController | null = null;

    this.parent.audioManager.playSoundEffect("lightning");

    this._tilesToDestroy
      .sort((t1, t2) => t1.col - t2.col)
      .forEach((t) => {
        if (prev == null) {
          prev = t;
          return;
        }

        const line = new Line(
          new Vec2(prev.node.position.x, prev.node.position.y),
          new Vec2(t.node.position.x, t.node.position.y)
        );

        vec.push(line);
        prev = t;
      });

    this._lightning.makeLightning(vec);

    return true;
  }
}
