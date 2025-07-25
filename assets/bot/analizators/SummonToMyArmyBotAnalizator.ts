import { AnalizedData } from "../../entities/field/AnalizedData";
import { TileController } from "../../entities/tiles/TileController";
import { StdTileController } from "../../entities/tiles/UsualTile/StdTileController";
import { CardAnalizator } from "../CardAnalizator";


export class SummonToMyArmyBotAnalizator extends CardAnalizator {

    getAvailableTilesForAction(data: AnalizedData): TileController[] {
        return this._fieldExt.getPlayerTiles(this.botModel).filter(t => {
            if (t instanceof StdTileController) {
                if (!t.shieldIsActivated) {
                    return t;
                }
            }
        });
    }
}
