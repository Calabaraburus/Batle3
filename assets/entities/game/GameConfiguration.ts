import { Service } from "../services/Service";
import { GameCardCfgModel } from "./GameCardCfgModel";
import { GameLevelCfgModel } from "./GameLevelCfgModel";

export class GameConfigurationModel {
  levels: GameLevelCfgModel[] = [];

  static getDefaultConfig() {
    const config = new GameConfigurationModel();

    const addLevel = (clb: (glvl: GameLevelCfgModel) => void) => {
      const lvl = new GameLevelCfgModel();

      clb(lvl);

      config.levels.push(lvl);
    };

    addLevel((lvl) => {
      lvl.lvlName = "lvl1";
      lvl.botHeroName = "bot1";
      lvl.botLife = "10";
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "40";
      lvl.endLevelBonus = "onecard";
      lvl.playerCards = [];
      lvl.endLevelBonusParams = ['firewallLow:3'];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl2";
      lvl.botHeroName = "bot2";
      lvl.botLife = "20";
      lvl.botCards = [{ mnemonic: "meteoriteLow", price: "2" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "twocards";
      lvl.endLevelBonusParams = ['berserkLow:3', 'assassinLow:3'];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl3";
      lvl.botHeroName = "bot3";
      lvl.botLife = "20";
      lvl.botCards = [{ mnemonic: "lightningMiddle", price: "4" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "life";
      lvl.endLevelBonusParams = ["20"];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl4";
      lvl.botHeroName = "bot4";
      lvl.botLife = "40";
      lvl.botCards = [{ mnemonic: "hammerMiddle", price: "4" }, { mnemonic: "totem", price: "4" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "twocards";
      lvl.endLevelBonusParams = ['c_attack:4', 'push:3'];

    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl5";
      lvl.botHeroName = "bot5";
      lvl.botLife = "50";
      lvl.botCards = [{ mnemonic: "wormMiddle", price: "4" }, { mnemonic: "mine", price: "3" }, { mnemonic: "push", price: "3" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "life";
      lvl.endLevelBonusParams = ["20"];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl6";
      lvl.botHeroName = "bot6";
      lvl.botLife = "70";
      lvl.botCards = [{ mnemonic: "pikeMiddle", price: "3" }, { mnemonic: "shamanLow", price: "3" }, { mnemonic: "maneuver", price: "4" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "twocards";
      lvl.endLevelBonusParams = ['firewallMiddle:4', 'meteoriteMiddle:3'];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl7";
      lvl.botHeroName = "bot7";
      lvl.botLife = "80";
      lvl.botCards = [{ mnemonic: "meteoriteMiddle", price: "4" }, { mnemonic: "berserk", price: "4" }, { mnemonic: "shield", price: "2" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "life";
      lvl.endLevelBonusParams = ["30"];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl8";
      lvl.botHeroName = "bot8";
      lvl.botLife = "90";
      lvl.botCards = [{ mnemonic: "lightningMiddle", price: "4" }, { mnemonic: "shield", price: "2" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "twocards";
      lvl.endLevelBonusParams = ['berserk:4', 'assassin:4'];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl9";
      lvl.botHeroName = "bot9";
      lvl.botLife = "115";
      lvl.botCards = [{ mnemonic: "hammer", price: "4" }, { mnemonic: "catapult", price: "4" }, { mnemonic: "push", price: "4" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
      lvl.endLevelBonus = "twocards";
      lvl.endLevelBonusParams = ['firewall:4', 'meteorite:4'];
    });


    addLevel((lvl) => {
      lvl.lvlName = "lvl10";
      lvl.botHeroName = "bot10";
      lvl.botLife = "120";
      lvl.botCards = [{ mnemonic: "assassin", price: "4" }, { mnemonic: "panic", price: "4" }];
      lvl.playerHeroName = "rezkar";
      lvl.playerLife = "";
      lvl.playerCards = [];
    });

    addLevel((lvl) => {
      lvl.lvlName = "lvl_arena";
      lvl.botHeroName = "arenaBot";
      lvl.botLife = "100";
      lvl.botCards = [];
      lvl.playerHeroName = "arenaPlayer";
      lvl.playerLife = "100";
      lvl.playerCards = [];
    });

    return config;
  }
}