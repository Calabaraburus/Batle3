import {
  AnalizedData,
  TileTypeToConnectedTiles,
} from "../entities/field/AnalizedData";
import { BotAnalizator } from "./BotAnalizator";

export class MaxTilesAttackBotAnalizator extends BotAnalizator {
  resultTiles: TileTypeToConnectedTiles | null;
  decide() {
    if (this.resultTiles == null) {
      return;
    }

    this.bot.pressTileSet(this.resultTiles?.connectedTiles);
  }

  analize(data: AnalizedData): number {
    this.weight = 0;
    this.resultTiles = this.getMaxConnected(data.connectedTiles);

    if (this.resultTiles == null) return 0;

    if (this.resultTiles.connectedTiles.size <= 0) return 0;
    this.weight = 1;
    return 1;
  }

  private getMaxConnected(
    connects: TileTypeToConnectedTiles[]
  ): TileTypeToConnectedTiles | null {
    return connects
      .filter((c) => c.tileModel.containsTag("player"))
      .reduce(
        (acc, connect) =>
          (acc =
            this.bot.tileService!.countShielded(acc.connectedTiles) >
            this.bot.tileService!.countShielded(connect.connectedTiles)
              ? acc
              : connect),
        connects[0]
      );
  }
}
