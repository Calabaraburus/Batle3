//  BonusModel.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  AudioClip,
  CCBoolean,
  CCInteger,
  CCObject,
  CCString,
  Component,
  SpriteFrame,
  _decorator,
} from "cc";
const { ccclass, property } = _decorator;

/**
 * Represents bonus model
 */
@ccclass("BonusModel")
export class BonusModel extends Component {
  @property(CCString)
  mnemonic = "mnem";

  @property(CCString)
  baseCardMnemonic = "";

  //** Amount of tiles that need to be destroied to activate bonus */
  @property({ type: CCInteger })
  public priceToActivate: number;

  @property({ type: SpriteFrame })
  public sprite: SpriteFrame;

  @property({ type: SpriteFrame })
  public unactiveSprite: SpriteFrame;

  @property({ type: CCBoolean })
  public active = false;

  //** Tiles of what type need to destroy to activate bonus */
  @property(CCString)
  public activateType = "-";

  // Bonus level
  @property(CCInteger)
  public bonusLevel = 0;

  //** Properties for info window */
  @property(CCString)
  cardName = "";

  @property(CCString)
  cardDescription = "";

  @property({ type: SpriteFrame })
  cardImage: SpriteFrame;

  @property({ type: SpriteFrame })
  cardImageForExample: SpriteFrame;

  @property({ type: CCInteger })
  maxCards: number = 3;

  //** Current amount that already destroied */
  private _currentAmmountToActivate = 0;

  get currentAmmountToActivate() {
    return this._currentAmmountToActivate;
  }

  set currentAmmountToActivate(value) {
    if (value < 0) value = 0;

    this._currentAmmountToActivate = value;

    if ((value / this.priceToActivate) > this.maxCards) {
      this._currentAmmountToActivate = this.maxCards * this.priceToActivate;
    }
  }

  selected = false;

  alreadyUsedOnTurn = false;

  public clone(): BonusModel {
    const bonus = new BonusModel();
    bonus.mnemonic = this.mnemonic;
    bonus.priceToActivate = this.priceToActivate;
    bonus.sprite = this.sprite;
    bonus.unactiveSprite = this.unactiveSprite;
    bonus.active = this.active;
    bonus.activateType = this.activateType;
    bonus.cardName = this.cardName;
    bonus.cardDescription = this.cardDescription;
    bonus.cardImage = this.cardImage;
    bonus.cardImageForExample = this.cardImageForExample;
    bonus._currentAmmountToActivate = this._currentAmmountToActivate;
    bonus.selected = this.selected;
    bonus.alreadyUsedOnTurn = this.alreadyUsedOnTurn;
    bonus.bonusLevel = this.bonusLevel;

    return bonus;
  }
}
