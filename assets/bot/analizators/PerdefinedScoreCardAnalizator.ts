import { AnalizedData } from "../../entities/field/AnalizedData";
import { TileController } from "../../entities/tiles/TileController";
import { CardAnalizator } from "../CardAnalizator";


export class PerdefinedScoreCardAnalizator extends CardAnalizator {

    protected _hasPredefinedScore = true;

    getAvailableTilesForAction(data: AnalizedData): TileController[] {
        const botTiles = this._fieldExt.getPlayerTiles(this.playerModel);
        return [botTiles.length > 0 ? botTiles[0] : new TileController()];
    }

}
