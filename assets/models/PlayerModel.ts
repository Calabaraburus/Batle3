import {
  _decorator,
  CCInteger,
  CCString,
  Component,
  CCFloat,
  SpriteFrame,
} from "cc";
import { BonusModel } from "./BonusModel";
const { ccclass, property } = _decorator;

/**
 * Represents player model
 */
@ccclass("PlayerModel")
export class PlayerModel extends Component {
  private _activeBonus: BonusModel | null;

  @property({ type: CCString })
  playerName = "player";

  @property({ type: CCInteger })
  life = 100;

  @property({ type: CCInteger })
  lifeMax = 100;

  @property({ type: CCInteger })
  manaMax = 50;

  @property({ type: CCInteger })
  manaCurrent = 0;

  @property({ type: CCFloat })
  manaIncreaseCoeficient = 1;

  @property({ type: CCFloat })
  power = 5;

  @property(SpriteFrame)
  heroImage: SpriteFrame;

  @property({ type: BonusModel })
  bonusesMetaData: BonusModel[] = [];

  private _bonuses: BonusModel[] = [];

  get bonuses() {
    return this._bonuses;
  }

  get activeBonus(): BonusModel | null {
    return this._activeBonus;
  }

  start() {

  }

  updateData() {
    this._bonuses = [];
    this.bonusesMetaData.forEach((metadata) => {
      this._bonuses.push(metadata.clone());
    });
  }

  public unSetBonus(): void {
    if (this._activeBonus != null) this._activeBonus.selected = false;
    this._activeBonus = null;
  }

  public setBonus(bonus: BonusModel): void {
    this._activeBonus = bonus;
    this._activeBonus.selected = true;
  }

  public isBonusSet(): boolean {
    return this._activeBonus != null;
  }

  public clone(): PlayerModel {
    return new (this.constructor as new () => this)();
  }
}
