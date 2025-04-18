import { randomRangeInt } from "cc";
import { AnalizedData } from "../../entities/field/AnalizedData";
import { TileController } from "../../entities/tiles/TileController";
import { StdTileController } from "../../entities/tiles/UsualTile/StdTileController";
import { CardAnalizator } from "../CardAnalizator";

export class PerdefinedScoreRandomCardAnalizator extends CardAnalizator {

    protected _hasPredefinedScore = true;

    getAvailableTilesForAction(data: AnalizedData): TileController[] {
        const botTiles = this._fieldExt.getPlayerTiles(this.playerModel).filter(t => {
            if (t instanceof StdTileController) {
                if (!t.shieldIsActivated) {
                    return t;
                }
            }
        });

        return [botTiles.length > 0 ? botTiles[randomRangeInt(0, botTiles.length)] : new TileController()];
    }
}

