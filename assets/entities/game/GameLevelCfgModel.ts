import { GameCardCfgModel } from "./GameCardCfgModel";


export class GameLevelCfgModel {
    arcName: string;
    lvlName: string;
    playerHeroName: string;
    botHeroName: string;

    playerLife: string;
    botLife: string;

    playerCards: GameCardCfgModel[] = [];
    botCards: GameCardCfgModel[] = [];

    endLevelBonus = '';
    endLevelBonusParams: string[] = []
}
