import { AnalizedData } from "../entities/field/AnalizedData";
import { TileController } from "../entities/tiles/TileController";
import { Bot } from "./Bot";
import { IBot } from "./IBot";

export class BotAnalizator {
  bot: Bot;

  private _weight = 0;
  public get weight() {
    return this._weight;
  }
  public set weight(value: number) {
    this._weight;
  }

  constructor(bot: Bot) {
    this.bot = bot;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  analize(data: AnalizedData): number {
    throw Error("Not implemented method");
  }

  decide() {
    throw Error("Not implemented method");
  }
}
