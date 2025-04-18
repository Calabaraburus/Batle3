import { randomRangeInt } from "cc";
import { AnalizedData } from "../../entities/field/AnalizedData";
import { TileController } from "../../entities/tiles/TileController";
import { StdTileController } from "../../entities/tiles/UsualTile/StdTileController";
import { CardAnalizator } from "../CardAnalizator";


export class ManeuverCardAnalizator extends CardAnalizator {

    protected _hasPredefinedScore = true;

    getAvailableTilesForAction(data: AnalizedData): TileController[] {


        const myCt = data.connectedTiles.filter(ct => ct.playerModel == this.botModel && !ct.tileModel.serviceTile);

        if (myCt.length <= 0) {
            return [];
        }

        myCt.sort((a, b) => -(a.connectedTiles.size - a.connectedTiles.size));

        const botTiles = Array.from(myCt[0].connectedTiles.values()).filter(t => {
            if (t instanceof StdTileController) {
                if (!t.shieldIsActivated && !t.tileModel.serviceTile) {
                    return t;
                }
            }
        });

        return [botTiles.length > 0 ? botTiles[randomRangeInt(0, botTiles.length)] : new TileController()];
    }
}
