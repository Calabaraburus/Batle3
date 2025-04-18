import { _decorator, game } from "cc";
import { LevelModel } from "../../models/LevelModel";
import { PlayerModel } from "../../models/PlayerModel";
import { DataService } from "./DataService";
import { Service } from "./Service";
import { GameManager } from "../game/GameManager";
import { GameState } from "../game/GameState";
const { ccclass, property } = _decorator;

@ccclass("CardService")
export class CardService extends Service {
  protected _dataService: DataService | null;
  protected _levelModel: LevelModel | null;
  private _gameState: GameState;

  start() {
    this._dataService = this.getService(DataService);
    this._levelModel = this.getService(LevelModel);
    this._gameState = this.getServiceOrThrow(GameState);
  }

  public updateBonusesActiveState(): void {
    const currentPlayer = this.getCurrentPlayerModel();
    currentPlayer?.bonuses.forEach((bonus) => {
      if (this._levelModel?.gameMechanicType == 0) {
        bonus.active = currentPlayer.manaCurrent >= bonus.priceToActivate;
      } else {
        bonus.active = bonus.currentAmmountToActivate >= bonus.priceToActivate;
      }
    });
  }

  public resetBonusesForActivePlayer(): void {
    this.getCurrentPlayerModel()?.bonuses.forEach(
      (b) => (b.alreadyUsedOnTurn = false)
    );
  }

  getCurrentPlayerModel(): PlayerModel | null | undefined {
    return this._gameState.isPlayerTurn
      ? this._dataService?.playerModel
      : this._dataService?.botModel;
  }

  getOponentModel(): PlayerModel | null | undefined {
    return this._gameState.isPlayerTurn
      ? this._dataService?.botModel
      : this._dataService?.playerModel;
  }

  getPlayerTag(): string {
    return this._gameState.isPlayerTurn ? "player" : "enemy";
  }

  getOponentTag(): string {
    return this._gameState.isPlayerTurn ? "enemy" : "player";
  }
}


