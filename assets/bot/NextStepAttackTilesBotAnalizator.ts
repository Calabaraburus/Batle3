import {
  AnalizedData,
  TileTypeToConnectedTiles,
} from "../entities/field/AnalizedData";
import { StdTileController } from "../entities/tiles/UsualTile/StdTileController";
import { BotAnalizator } from "./BotAnalizator";

export class NextStepAttackTilesBotAnalizator extends BotAnalizator {
  resultTiles: TileTypeToConnectedTiles;
  decide() {
    this.bot.pressTileSet(this.resultTiles.connectedTiles);
  }

  analize(data: AnalizedData): number {
    const field = this.bot.field;
    let tci = -1;
    let wmax = -1;
    this.weight = 0;

    data.connectedTiles.forEach((ct, ci) => {
      const tcolMap: number[] = [];
      let lmax = 0;

      if (ct.tileModel.containsTag("enemy")) {
        return;
      }

      ct.connectedTiles.forEach((t, i) => {
        if (t instanceof StdTileController) {
          if (!t.shieldIsActivated) {
            if (isNaN(tcolMap[t.col])) {
              tcolMap[t.col] = 0;

              field.fieldMatrix.forEachCol(t.col, (tile) => {
                if (tile.tileModel.containsTag("player")) tcolMap[t.col]--;
              });
            }
            tcolMap[t.col]++;
          }
        }
      });

      tcolMap.forEach((n) => {
        if (n == 0) {
          lmax += 2;
        } else {
          lmax += -n / field.fieldModel.rows;
        }
      });

      if (wmax < lmax) {
        tci = ci;
        wmax = lmax;
        this.resultTiles = ct;
      }
    });

    this.weight = wmax;
    return wmax;
  }
}
