import {
    Sprite,
    _decorator,
    Node,
    assert,
    RichText,
    Label,
    System, Prefab, instantiate, PageView, tween,
    UITransform
} from 'cc';
import { Service } from '../../services/Service';
import { SettingsLoader } from '../../services/SettingsLoader';
import { LevelConfiguration } from '../../configuration/LevelConfiguration';
import { OverlayWindow } from '../../menu/OverlayWindow';
import { GameLevelCfgModel } from '../../game/GameLevelCfgModel';
import { LevelSelectorController } from '../../level/LevelSelectorController';
import { PlayerModel } from '../../../models/PlayerModel';
import { BonusModel } from '../../../models/BonusModel';
import { t, init as i18n_init } from '../../../../extensions/i18n/assets/LanguageData';
import { Window } from './Window';
import { preferencesProtocol } from '../../../../extensions/i18n/@types/editor/profile/public/interface';
import { CardInfoPage } from './CardInfoPage';
import { StartLevelWindow } from './StartLevelWindow';
import { PlayerCurrentGameState } from '../../services/PlayerCurrentGameState';
import { GameCardCfgModel } from '../../game/GameCardCfgModel';

const { ccclass, property } = _decorator;

@ccclass('InfoWindow')
export class InfoWindow extends StartLevelWindow {
    private _playerCardModels: BonusModel[];
    private _curState: PlayerCurrentGameState;

    @property(PageView)
    cardInfoPlayerPagesView: PageView;

    @property(PageView)
    bonusInfoPagesView: PageView

    public get isOpened() {
        return this._wnd ? this._wnd.isOpened : false;
    }

    override start(): void {
        super.start();

        this._curState = this._settings.playerCurrentGameState;
        //   this._level = this._settings.gameConfiguration.levels.find(l => l.lvlName == this._levelName);

        //for (let index = 0; index < 3; index++) {
        //  this.cardInfoPlayerPagesView.addPage(instantiate(this.cardInfoPagePrefab));
        //}
    }

    override fillImageData() {
        super.fillImageData();

        const bonuses = this._levelConfig.node
            .getChildByName("BonusModels")
            ?.getComponentsInChildren(BonusModel);

        assert(bonuses != null);

        // this._playerCardSprites.forEach(cs => cs.node.active = false);

        this._playerCardModels = [];

        let cards: GameCardCfgModel[];

        if (this._levelConfigModel.playerCards.length > 0) {
            cards = this._levelConfigModel.playerCards;
        }
        else {
            cards = this._curState.cards;
        }

        if (this._gameManager) {
            const config = this.getServiceOrThrow(LevelConfiguration);
            config.playerModel.bonuses.forEach((model, i) => {
                this._playerCardModels.push(model);
            });
        } else {
            cards.forEach((bc, i) => {
                const bonusModel = bonuses?.find((bm) => bm.mnemonic == bc.mnemonic);

                if (bonusModel) {
                    this._playerCardModels.push(bonusModel);
                }
            });
        }
    }

    showPlayerCardInfoByModel(cardModel: BonusModel) {
        for (let i = 0; i < this._playerCardModels.length; i++) {
            const thisModel = this._playerCardModels[i];

            if (thisModel.mnemonic == cardModel.mnemonic) {
                this.showPlayerCardInfo((i + 1).toString());

                break;
            }
        }
    }

    showPlayerCardInfo(cardNumber: string) {

        this.cardInfoPlayerPagesView.removeAllPages();
        if (this.cardInfoPlayerPagesView.content) {
            this.cardInfoPlayerPagesView.content.children.length = 0;
        }

        for (let i = 0; i < this._playerCardModels.length; i++) {
            const cardModel = this._playerCardModels[i];

            const page = instantiate(this.cardInfoPagePrefab);
            const cardPage = page.getComponent(CardInfoPage);

            if (cardPage) {

                var trfrm = cardPage.getComponent(UITransform);

                if (trfrm && this._uiTransform) {
                    trfrm.width = this._uiTransform.width;
                }

                cardPage.node.active = true;
                cardPage.setInfo(cardModel);

                this.cardInfoPlayerPagesView.addPage(page);
            }
        }
        this._wnd?.showContentGroup("cardPlayer");

        this.cardInfoPlayerPagesView.setCurrentPageIndex(Number(cardNumber) - 1);
        this.cardInfoPlayerPagesView.scrollToPage(Number(cardNumber) - 1, 0.0001);

    }

    showBonusInfo(cardModel: BonusModel) {

        this.bonusInfoPagesView.removeAllPages();

        const page = instantiate(this.cardInfoPagePrefab);
        const cardPage = page.getComponent(CardInfoPage);

        if (cardPage) {

            var trfrm = cardPage.getComponent(UITransform);

            if (trfrm && this._uiTransform) {
                trfrm.width = this._uiTransform.width;
            }

            cardPage.node.active = true;
            cardPage.setInfo(cardModel);

            this.bonusInfoPagesView.addPage(page);
        }

        this._wnd?.showContentGroup("bonus");

    }
}
