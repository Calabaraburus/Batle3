import {
    Sprite,
    _decorator,
    Node,
    assert,
    RichText,
    Label,
    System, Prefab, instantiate, PageView, tween, SpriteFrame,
    resources,
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
import { CardStrtLVLWnd } from './CardStrtLVLWnd';
import { GameManager } from '../../game/GameManager';
import { InGameLevelLoaderService } from '../../level/InGameLevelLoaderService';

const { ccclass, property } = _decorator;

@ccclass('StartLevelWindow')
export class StartLevelWindow extends Service {

    @property(Sprite)
    HeroImage: Sprite;

    @property(CardStrtLVLWnd)
    card_1: CardStrtLVLWnd;

    @property(CardStrtLVLWnd)
    card_2: CardStrtLVLWnd;

    @property(CardStrtLVLWnd)
    card_3: CardStrtLVLWnd;

    @property(Label)
    scenarioTxt: Label;

    @property(Label)
    levelNumberLabel: Label;

    @property(Label)
    levelNameLabel: Label;

    @property(PageView)
    cardInfoPagesView: PageView

    @property(Prefab)
    cardInfoPagePrefab: Prefab;

    @property(SpriteFrame)
    crystalSprites: SpriteFrame[] = [];

    @property(Label)
    scrollNameLabel: Label;

    @property(Label)
    scrollTextLabel: Label;

    @property(Sprite)
    scrollImageLabel: Sprite;

    protected _levelName: string;
    private _wndOverlay: OverlayWindow | null;
    protected _wnd: Window | null;
    protected _settings: SettingsLoader;
    protected _levelConfigModel: GameLevelCfgModel;
    protected _levelConfig: LevelConfiguration
    private _cardSprites: CardStrtLVLWnd[] = [];
    private _levelSelector: LevelSelectorController;
    private _botCardModels: BonusModel[];
    private _isInit = false;
    protected _gameManager: GameManager | null;
    private _inGameLoader: InGameLevelLoaderService | null;
    protected _uiTransform: UITransform | null;

    start(): void {
        this._settings = this.getServiceOrThrow(SettingsLoader);
        this._levelConfig = this.getServiceOrThrow(LevelConfiguration);
        this._wndOverlay = this.getComponent(OverlayWindow);
        this._wnd = this.getComponent(Window);
        this._uiTransform = this.cardInfoPagesView.getComponent(UITransform);
        this._gameManager = this.getService(GameManager);
        this._inGameLoader = this.getService(InGameLevelLoaderService);

        const tmpSelector = this.getService(LevelSelectorController);

        if (tmpSelector) {
            this._levelSelector = tmpSelector;
        }

        this._cardSprites.push(this.card_1);
        this._cardSprites.push(this.card_2);
        this._cardSprites.push(this.card_3);

        for (let index = 0; index < 3; index++) {
            this.cardInfoPagesView.addPage(instantiate(this.cardInfoPagePrefab));
        }
    }

    showWindow(sender: any, path: string = "") {
        if (this._isInit == false) {
            this._isInit = true;
            this.start();
            this._wnd?.start();
        }

        this._wndOverlay?.showWindow();

        const openers = new Map<string, (name: string) => void>();

        openers.set("lvl", (name: string) => {
            this._levelName = name;
            const tcfg = this._settings.gameConfiguration.levels.find(lvl => lvl.lvlName == name);

            assert(tcfg != null);

            this._levelConfigModel = tcfg;

            this.fillImageData();
            this.fillStrings();

            this._wnd?.showContentGroup("default");
        });

        openers.set("scroll", (name: string) => {
            this.fillScrollData(name);
            this._wnd?.showContentGroup("scroll");
        });

        if (path != "") {

            const key = path.split(":")[0];
            const val = path.split(":")[1];


            if (key.toLowerCase().includes("scroll")) {
                const opener = openers.get("scroll");
                if (opener) opener(val);
            } else {
                const opener = openers.get("lvl");
                if (opener) opener(val);
            }

        }
    }

    fillImageData() {
        const player = this._levelConfig.node
            .getChildByName("HeroModels")!
            .getChildByName(LevelSelectorController.titleCaseWord(this._levelConfigModel.botHeroName) + "Hero")
            ?.getComponent(PlayerModel);

        assert(player != null);

        const bonuses = this._levelConfig.node
            .getChildByName("BonusModels")
            ?.getComponentsInChildren(BonusModel);

        assert(bonuses != null);

        this.HeroImage.spriteFrame = player?.heroImage;

        this._cardSprites.forEach(cs => cs.card.node.active = false);

        this._botCardModels = []

        const pushBonus = (model: BonusModel, index: number) => {
            this._botCardModels.push(model);
            this._cardSprites[index].card.spriteFrame = model.sprite;
            this._cardSprites[index].card.node.active = true;
            this.updateLevelSprite(model, this._cardSprites[index].lvlIco);
        };

        if (this._gameManager) {
            const config = this.getServiceOrThrow(LevelConfiguration);
            config.botModel.bonuses.forEach((model, i) => {
                pushBonus(model, i);
            });

        } else {
            this._levelConfigModel.botCards.forEach((bc, i) => {
                const bonusModel = bonuses?.find((bm) => bm.mnemonic == bc.mnemonic);

                if (bonusModel) {
                    pushBonus(bonusModel, i);
                }
            });
        }
    }

    fillScrollData(name: string) {
        this.scrollNameLabel.string = t(`scrolls.${name}.name`);

        this.scrollTextLabel.string = t(`scrolls.${name}.text`);

        resources.load(`images/${t(`scrolls.${name}.image`)}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            this.scrollImageLabel.spriteFrame = spriteFrame;
        });
    }

    fillStrings() {
        this.scenarioTxt.string = t(`levels.${this._levelName}.intro`);

        if (this._settings.playerCurrentGameState.levelExists(this._levelName)) {
            this.scenarioTxt.string += "\n\n—\n\n";
            this.scenarioTxt.string += t(`levels.${this._levelName}.ending`);
        }

        this.levelNameLabel.string = t(`levels.${this._levelName}.name`);
        this.levelNumberLabel.string = t(`levels.${this._levelName}.num`);
    }

    hideWindow() {
        this._wndOverlay?.hideWindow();
    }

    updateLevelSprite(model: BonusModel, sprite: Sprite) {
        switch (model.bonusLevel) {
            case 0:
                sprite.spriteFrame = null;
                break;
            case 1:
                sprite.spriteFrame = this.crystalSprites[0];
                break;
            case 2:
                sprite.spriteFrame = this.crystalSprites[1];
                break;
        }
    }

    showCardInfo(sender: any, cardNumber: string) {

        this.cardInfoPagesView.removeAllPages();

        for (let i = 0; i < this._botCardModels.length; i++) {
            const cardModel = this._botCardModels[i];

            const page = instantiate(this.cardInfoPagePrefab)
            const cardPage = page.getComponent(CardInfoPage);

            if (cardPage) {
                var trfrm = cardPage.getComponent(UITransform);

                if (trfrm && this._uiTransform) {
                    trfrm.width = this._uiTransform.width;
                }

                cardPage.node.active = true;
                cardPage.setInfo(cardModel);

                this.cardInfoPagesView.addPage(page);
            }
        }

        this._wnd?.showContentGroup("card");

        this.cardInfoPagesView.setCurrentPageIndex(Number(cardNumber) - 1);
        this.cardInfoPagesView.scrollToPage(Number(cardNumber) - 1, 0.0001);
    }

    showCardInfoByModel(sender: any, cardModel: BonusModel) {

        this.cardInfoPagesView.removeAllPages();

        const page = instantiate(this.cardInfoPagePrefab)
        const cardPage = page.getComponent(CardInfoPage);

        if (cardPage) {

            var trfrm = cardPage.getComponent(UITransform);

            if (trfrm && this._uiTransform) {
                trfrm.width = this._uiTransform.width;
            }

            cardPage.node.active = true;
            cardPage.setInfo(cardModel);

            this.cardInfoPagesView.addPage(page);
        }

        this._wnd?.showContentGroup("card");

    }

    hideCardInfo() {
        this._wnd?.showContentGroup("default");
    }

    loadLevel() {
        this._inGameLoader?.loadLevel(this, this._levelName);
    }

    loadCustomLevel(e: any, lvlName: string) {
        this._inGameLoader?.loadScene(this, lvlName);
    }

}