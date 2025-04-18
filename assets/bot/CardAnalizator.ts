import { FieldControllerExtensions } from "../entities/field/FieldExtensions";
import { ITileFieldController } from "../entities/field/ITileFieldController";
import { BonusModel } from "../models/BonusModel";
import { LevelModel } from "../models/LevelModel";
import { PlayerModel } from "../models/PlayerModel";
import { BotTileSelectionStrategy } from "./BotTileSelectionStrategy";
import { IBot } from "./IBot";

export class CardAnalizator extends BotTileSelectionStrategy {
  private _cardModel: BonusModel;
  private _levelModel: LevelModel | null;
  private _playerModel: PlayerModel;
  protected _isStochastic: boolean;
  protected _hasPredefinedScore = false;
  protected _fieldExt: FieldControllerExtensions;
  private _field: ITileFieldController;

  public get playerModel(): PlayerModel {
    return this._playerModel;
  }

  public get botModel(): PlayerModel {
    return this.bot.botModel;
  }

  public get isStochastic(): boolean {
    return this._isStochastic;
  }

  public get cardModel(): BonusModel {
    return this._cardModel;
  }

  public get field(): ITileFieldController {
    return this._field;
  }

  public get hasPredefinedScore() {
    return this._hasPredefinedScore;
  }

  public set field(value: ITileFieldController) {
    this._field = value;
    this._fieldExt = new FieldControllerExtensions(this._field);
  }

  constructor(cardModel: BonusModel,
    bot: IBot,
    field: ITileFieldController,
    playerModel: PlayerModel) {

    super(bot);
    this._cardModel = cardModel;
    this._isStochastic = false;
    this._field = field;
    this._playerModel = playerModel;
  }

  public canActivateCard(): boolean {
    if (this._levelModel?.gameMechanicType == 0) {
      return this.bot.botModel.manaCurrent >= this.cardModel.priceToActivate;
    } else {
      return this.cardModel.currentAmmountToActivate >= this.cardModel.priceToActivate;
    }
  }

  public predefinedScore(): number {
    return 0;
  }

  public Apply(): void { }
}


