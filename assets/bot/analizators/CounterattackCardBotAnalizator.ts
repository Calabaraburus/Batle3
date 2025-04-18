import { random } from "cc";
import { AnalizedData } from "../../entities/field/AnalizedData";
import { CardAnalizator } from "../CardAnalizator";
import { TileController } from "../../entities/tiles/TileController";
import { StdTileController } from "../../entities/tiles/UsualTile/StdTileController";

export class CounterattackCardBotAnalizator extends CardAnalizator {
  private bonusName = "c_attack";

  getAvailableTilesForAction(data: AnalizedData): TileController[] {
    const botTiles = this._fieldExt.getPlayerTiles(this.botModel);
    return [botTiles.length > 0 ? botTiles[0] : new TileController()];
  }
}
