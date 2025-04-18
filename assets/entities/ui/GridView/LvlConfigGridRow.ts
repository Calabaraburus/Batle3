import { Component, EditBox, _decorator, find } from 'cc';
import { GameLevelCfgModel } from '../../game/GameLevelCfgModel';
import { GameCardCfgModel } from '../../game/GameCardCfgModel';
const { ccclass, property } = _decorator;


@ccclass('LvlConfigGridRow')
export class LvlConfigGridRow extends Component {


    private _lvlCfg: GameLevelCfgModel = new GameLevelCfgModel();
    private _LvlNameEditBox: EditBox | null | undefined;
    private _HeroNameEditBox: EditBox | null | undefined;
    private _BotLifeNameEditBox: EditBox | null | undefined;
    private _HeroLifeEditBox: EditBox | null | undefined;
    private _BotHeroNameEditBox: EditBox | null | undefined;
    private _PlayerCardNameEditBox_001: EditBox | null | undefined;
    private _PlayerCardNameEditBox_002: EditBox | null | undefined;
    private _PlayerCardNameEditBox_003: EditBox | null | undefined;
    private _BotCardNameEditBox_001: EditBox | null | undefined;
    private _BotCardNameEditBox_002: EditBox | null | undefined;
    private _BotCardNameEditBox_003: EditBox | null | undefined;
    private _PlayerCardPriceEditBox_001: EditBox | null | undefined;
    private _PlayerCardPriceEditBox_002: EditBox | null | undefined;
    private _PlayerCardPriceEditBox_003: EditBox | null | undefined;
    private _BotCardPriceEditBox_001: EditBox | null | undefined;
    private _BotCardPriceEditBox_002: EditBox | null | undefined;
    private _BotCardPriceEditBox_003: EditBox | null | undefined;
    private _BonusTypeEditBox: EditBox | null | undefined;
    private _BonusTypeParametersEditBox: EditBox | null | undefined;

    public get lvlCfgRow() {
        this.fillLvlCfg();
        return this._lvlCfg;
    }

    public set lvlCfgRow(value: GameLevelCfgModel) {
        this._lvlCfg = value;
        this.fillRowWithLvlCfg();
    }



    onLoad(): void {
        this._LvlNameEditBox = this.getEb('LvlNameEditBox');
        this._HeroNameEditBox = this.getEb('HeroNameEditBox');
        this._HeroLifeEditBox = this.getEb('HeroLifeEditBox');
        this._BotHeroNameEditBox = this.getEb('BotHeroNameEditBox');
        this._BotLifeNameEditBox = this.getEb('BotLifeNameEditBox');
        this._PlayerCardNameEditBox_001 = this.getEb('PlayerCardNameEditBox-001');
        this._PlayerCardNameEditBox_002 = this.getEb('PlayerCardNameEditBox-002');
        this._PlayerCardNameEditBox_003 = this.getEb('PlayerCardNameEditBox-003');
        this._BotCardNameEditBox_001 = this.getEb('BotCardNameEditBox-001');
        this._BotCardNameEditBox_002 = this.getEb('BotCardNameEditBox-002');
        this._BotCardNameEditBox_003 = this.getEb('BotCardNameEditBox-003');
        this._PlayerCardPriceEditBox_001 = this.getEb('PlayerCardPriceEditBox-001');
        this._PlayerCardPriceEditBox_002 = this.getEb('PlayerCardPriceEditBox-002');
        this._PlayerCardPriceEditBox_003 = this.getEb('PlayerCardPriceEditBox-003');
        this._BotCardPriceEditBox_001 = this.getEb('BotCardPriceEditBox-001');
        this._BotCardPriceEditBox_002 = this.getEb('BotCardPriceEditBox-002');
        this._BotCardPriceEditBox_003 = this.getEb('BotCardPriceEditBox-003');
        this._BonusTypeEditBox = this.getEb('BonusTypeEditBox');
        this._BonusTypeParametersEditBox = this.getEb('BonusTypeParametersEditBox');
    }

    getEb(name: string) {
        const child = this.node.getChildByName(name);
        return child?.getComponent(EditBox);
    }

    fillRowWithLvlCfg() {
        this._LvlNameEditBox!.string = this._lvlCfg.lvlName;

        this._BotHeroNameEditBox!.string = this._lvlCfg.botHeroName;
        this._BotLifeNameEditBox!.string = this._lvlCfg.botLife;

        const botCNames = [this._BotCardNameEditBox_001,
        this._BotCardNameEditBox_002,
        this._BotCardNameEditBox_003];

        const botPrices = [this._BotCardPriceEditBox_001,
        this._BotCardPriceEditBox_002,
        this._BotCardPriceEditBox_003]

        botCNames.forEach(cn => { if (cn) cn.string = ""; });
        botPrices.forEach(p => { if (p) p.string = ""; });

        this._lvlCfg.botCards.forEach((v, i) => {
            botCNames[i]!.string = v.mnemonic;
            botPrices[i]!.string = v.price;
        });

        this._HeroNameEditBox!.string = this._lvlCfg.playerHeroName;
        this._HeroLifeEditBox!.string = this._lvlCfg.playerLife;

        const playerCNames = [this._PlayerCardNameEditBox_001,
        this._PlayerCardNameEditBox_002,
        this._PlayerCardNameEditBox_003];

        const playerPrices = [this._PlayerCardPriceEditBox_001,
        this._PlayerCardPriceEditBox_002,
        this._PlayerCardPriceEditBox_003]

        playerCNames.forEach(cn => { if (cn) cn.string = ""; });
        playerPrices.forEach(p => { if (p) p.string = ""; });

        this._lvlCfg.playerCards.forEach((v, i) => {
            playerCNames[i]!.string = v.mnemonic;
            playerPrices[i]!.string = v.price;
        });

        this._BonusTypeEditBox!.string = this._lvlCfg.endLevelBonus;
        this._BonusTypeParametersEditBox!.string = this._lvlCfg.endLevelBonusParams.join(';');
    }

    fillLvlCfg() {
        this._lvlCfg.lvlName = this._LvlNameEditBox!.string;

        this._lvlCfg.botHeroName = this._BotHeroNameEditBox!.string;
        this._lvlCfg.botLife = this._BotLifeNameEditBox!.string;
        this.fillBotCard(this._lvlCfg.botCards,
            [this._BotCardNameEditBox_001!.string,
            this._BotCardNameEditBox_002!.string,
            this._BotCardNameEditBox_003!.string],
            [this._BotCardPriceEditBox_001!.string,
            this._BotCardPriceEditBox_002!.string,
            this._BotCardPriceEditBox_003!.string]);

        this._lvlCfg.playerHeroName = this._HeroNameEditBox!.string;
        this._lvlCfg.playerLife = this._HeroLifeEditBox!.string;
        this.fillBotCard(this._lvlCfg.playerCards,
            [this._PlayerCardNameEditBox_001!.string,
            this._PlayerCardNameEditBox_002!.string,
            this._PlayerCardNameEditBox_003!.string],
            [this._PlayerCardPriceEditBox_001!.string,
            this._PlayerCardPriceEditBox_002!.string,
            this._PlayerCardPriceEditBox_003!.string]);

        this._lvlCfg.endLevelBonus = this._BonusTypeEditBox!.string;
        this._lvlCfg.endLevelBonusParams = this._BonusTypeParametersEditBox!.string.split(';');
    }

    fillBotCard(cardList: GameCardCfgModel[], names: string[], prices: string[]) {
        cardList.length = 0;

        for (let index = 0; index < names.length; index++) {
            const element = names[index];
            const price = prices[index];
            if (element != "") {
                const cfgM = new GameCardCfgModel();
                cfgM.mnemonic = element;
                cfgM.price = price;

                cardList.push(cfgM);
            }
        }
    }

}
