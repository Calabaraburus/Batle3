import { Service } from '../../services/Service';
import { BonusModel } from '../../../models/BonusModel';
import { Sprite, _decorator, Node, assert, RichText, Label, System, SpriteFrame, LabelAtlas } from 'cc';
import { t } from '../../../../extensions/i18n/assets/LanguageData';

const { ccclass, property } = _decorator;

@ccclass('CardInfoPage')
export class CardInfoPage extends Service {


    @property(Sprite)
    cardImage: Sprite;

    @property(Label)
    cardName: Label;

    @property(Label)
    cardDescription: Label;

    @property(SpriteFrame)
    lvlSprites: SpriteFrame[] = [];

    @property(Sprite)
    crystalSprite: Sprite;

    public setInfo(cardModel: BonusModel) {
        this.cardImage.spriteFrame = cardModel.sprite;
        this.cardName.string = t(`cards.${cardModel.mnemonic}.name`);
        this.cardDescription.string = t(`cards.${cardModel.mnemonic}.description`) + "\n\n"
            + t(`cards.${cardModel.mnemonic}.application`);
        this.updateLevelSprite(cardModel);
    }

    updateLevelSprite(cardModel: BonusModel) {
        switch (cardModel.bonusLevel) {
            case 0:
                this.crystalSprite.spriteFrame = null;
                break;
            case 1:
                this.crystalSprite.spriteFrame = this.lvlSprites[0];
                break;
            case 2:
                this.crystalSprite.spriteFrame = this.lvlSprites[1];
                break;
        }
    }

}
