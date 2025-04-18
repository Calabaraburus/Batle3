import { AnalizedData } from "../entities/field/AnalizedData";
import { TileController } from "../entities/tiles/TileController";
import { IBot } from "./IBot";


export class BotTileSelectionStrategy {
  bot: IBot;

  constructor(bot: IBot) {
    this.bot = bot;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAvailableTilesForAction(data: AnalizedData): TileController[] {
    throw Error("Not implemented method");
  }

}
