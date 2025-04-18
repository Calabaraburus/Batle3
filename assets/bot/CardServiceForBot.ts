import { CardService } from "../entities/services/CardService";
import { DataService } from "../entities/services/DataService";
import { LevelModel } from "../models/LevelModel";
import { PlayerModel } from "../models/PlayerModel";

export class CardServiceForBot extends CardService {

    set dataService(value: DataService) {
        this._dataService = value;
    }

    set levelModel(value: LevelModel) {
        this._levelModel = value;
    }

    getCurrentPlayerModel(): PlayerModel | null | undefined {
        return this._dataService?.botModel;
    }

    getOponentModel(): PlayerModel | null | undefined {
        return this._dataService?.playerModel;
    }

    getPlayerTag(): string {
        return "player";
    }

    getOponentTag(): string {
        return "enemy";
    }

    start() { }
}
