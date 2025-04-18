import { math, random, randomRange } from "cc";
import { AnalizedData } from "../../entities/field/AnalizedData";
import { TileController } from "../../entities/tiles/TileController";
import { StdTileController } from "../../entities/tiles/UsualTile/StdTileController";
import { BotAnalizator } from "../BotAnalizator";
import { CardAnalizator } from "../CardAnalizator";


export class AllMyTilesBotAnalizator extends CardAnalizator {
    getAvailableTilesForAction(data: AnalizedData): TileController[] {
        return this._fieldExt.getPlayerTiles(this.botModel);
    }
}
