import {
  AnalizedData,
  TileTypeToConnectedTiles
} from "../entities/field/AnalizedData";
import { TileController } from "../entities/tiles/TileController";
import { StdTileController } from "../entities/tiles/UsualTile/StdTileController";
import { BotTileSelectionStrategy } from "./BotTileSelectionStrategy";

export class StdSelectorBotStrategy extends BotTileSelectionStrategy {
  resultTiles: TileTypeToConnectedTiles | null;

  getAvailableTilesForAction(data: AnalizedData): TileController[] {

    let result: TileController[] = [];

    data.connectedTiles.forEach(ct => {
      const tiles = Array.from(ct.connectedTiles).filter(t => {
        if (t instanceof (StdTileController)) {
          if (!t.shieldIsActivated && t.playerModel != this.bot.botModel) {
            return t;
          }
        }
      });

      if (tiles.length >= 2) {
        result.push(tiles[0]);
      }

    });

    return result;
  }
}

