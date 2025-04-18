//  LevelSelectorController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  Component,
  director,
  _decorator,
  randomRangeInt,
  random,
  AudioSource,
  LineComponent,
  assert,
  resources,
  TextAsset,
} from "cc";
import { Service } from "../services/Service";
import { SceneLoaderService } from "../services/SceneLoaderService";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { BonusModel } from "../../models/BonusModel";
import { PlayerModel } from "../../models/PlayerModel";
import { EndLevelCardSelectorBonusModel } from "../configuration/EndLevelCardSelectorBonusModel";
import { EndLevelLifeBonusModel } from "../configuration/EndLevelLifeBonusModel";
import { EndLevelCardUpdateBonusModel } from "../configuration/EndLevelCardUpdateBonusModel";
import { SettingsLoader } from "../services/SettingsLoader";
import { GameLevelCfgModel } from "../game/GameLevelCfgModel";
import { PlayerCurrentGameState } from "../services/PlayerCurrentGameState";
import { GameCardCfgModel } from "../game/GameCardCfgModel";
import { FieldModel } from "../../models/FieldModel";
import { Tutorial1Logic } from "../tutor/Tutorial1Logic";
import { AudioConfigurator } from "../services/AudioConfigurator";
import { GameManager } from "../game/GameManager";
import { TileCreator } from "../field/TileCreator";
import { TileController } from "../tiles/TileController";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { LevelView } from "./LevelView";
import { EnemyFieldController } from "../enemyField/EnemyFieldController";
import { MonkSummonerTileController } from "../tiles/MonkSummonerTile/MonkSummonerTileController";
import { DataService } from "../services/DataService";
import { FieldController } from "../field/FieldController";
import { AttackSignalController } from "../attackSignal/AttackSignalController";
import { Analitics } from "../../scripts/analitics/Analitics";
import { Bot_v2 } from "../../bot/Bot_v2";
const { ccclass, property } = _decorator;

@ccclass("LevelSelectorController")
export class LevelSelectorController extends Service {
  private _sceneLoader: SceneLoaderService;
  private _analitics: Analitics;
  //private _bonusSorted: BonusModel[][];
  configDict = new Map<string, (config: LevelConfiguration) => void>();
  private _settingsLoader: SettingsLoader;

  field_maps = new Map<string, TextAsset>();
  private _audoConfig: AudioConfigurator;

  start() {
    //    resources.preloadDir("filed_maps");

    resources.loadDir("filed_maps", (err, assets) => {
      assets.forEach((asset) => {
        if (asset instanceof TextAsset) {
          this.field_maps.set(asset.name, asset);
        }
      });
    });

    this._analitics = new Analitics();
    this._sceneLoader = this.getServiceOrThrow(SceneLoaderService);
    this._settingsLoader = this.getServiceOrThrow(SettingsLoader);
    this._audoConfig = this.getServiceOrThrow(AudioConfigurator);
    this._settingsLoader.loadGameConfiguration();
    this.fillConfigurations();

  }

  public getCfgByLvlName(levelName: string) {
    return this.configDict.get(levelName);
  }

  fillConfigurations() {
    this.configDict.set("test", (config) => {
      config.botHeroName = "testBot";
      config.playerHeroName = "testPlayer";
    });

    const settingsLoader = this.getServiceOrThrow(SettingsLoader);

    const setMap = (config: LevelConfiguration, mapName: string) => {
      const fm = config.node.getComponentInChildren(FieldModel);
      if (fm) {
        const m = field_maps.get(mapName);
        if (m) {
          fm.fieldMap = m;
        }
      }
    };

    const configurateAudio = () => {
      this._audoConfig.applyList(this._audoConfig.levelMusicList);
    }

    const std_init = (config: LevelConfiguration, lvl: GameLevelCfgModel, mapName = "map6") => {

      configurateAudio();

      setMap(config, mapName);

      config.levelName = lvl.lvlName;

      const player = this.configPlayerStd({ config, name: lvl.playerHeroName, life: Number(lvl.playerLife) })
      const bot = this.configPlayerStd({ config, name: lvl.botHeroName, life: Number(lvl.botLife), isBot: true })

      assert(player != null);
      assert(bot != null);

      this.loadPlayerState(
        config,
        lvl,
        settingsLoader.playerCurrentGameState,
        player
      );

      const bonuses: { name: string; price: number }[] = [];

      bonuses.length = 0;
      lvl.botCards.forEach((c) =>
        bonuses.push({ name: c.mnemonic, price: Number(c.price) })
      );

      this.addBonuses(config, bot, bonuses);

      config.endLevelBonuses = [];

      switch (lvl.endLevelBonus.toLowerCase()) {
        case "onecard":
          this.setEndBonusCard(config, lvl.endLevelBonusParams[0]);
          break;
        case "twocards":
          this.setEndBonusTwoCards(config, lvl.endLevelBonusParams);
          break;
        case "life":
          this.setEndBonusLife(config, lvl.endLevelBonusParams[0]);
          break;
        default:
          break;
      }

      config.updateData();

      setBotLevel(1, 1);

      this._analitics.startLevel(lvl.lvlName);
    }

    const specAlgs = new Map<string, (config: LevelConfiguration, lvl: GameLevelCfgModel) => void>();

    const field_maps = this.field_maps;

    const setTutor = (id: number) => {
      const t1 = this.getServiceOrThrow(Tutorial1Logic);
      t1.currentTutorialGraphId = id;
      t1.setupGraph();
      t1.node.active = true;
    }

    const setBotLevel = (strengthMin: number, strengthMax: number) => {

      const settingsLoader = this.getServiceOrThrow(Bot_v2);

      settingsLoader.strengthMin = strengthMin;
      settingsLoader.strengthMax = strengthMax;
    }

    // tutor1
    specAlgs.set("lvl1", (config: LevelConfiguration, lvl: GameLevelCfgModel) => {

      std_init(config, lvl, "map_tutor1");
      setTutor(0);
      setBotLevel(0.1, 0.3);
    });

    // tutor2
    specAlgs.set("lvl2", (config: LevelConfiguration, lvl: GameLevelCfgModel) => {

      std_init(config, lvl, "map6");
      setTutor(1);
      setBotLevel(0.7, 0.9);
    });

    specAlgs.set("lvl3", (config: LevelConfiguration, lvl: GameLevelCfgModel) => {
      std_init(config, lvl, "map6");
      const botCard = config.botModel.bonuses.length > 0 ? config.botModel.bonuses[0] : null;

      if (botCard) {
        botCard.currentAmmountToActivate = botCard.priceToActivate;
      }

      setBotLevel(0.75, 1);
    });


    // lvl_monastery
    specAlgs.set("lvl5", (config: LevelConfiguration, lvl: GameLevelCfgModel) => {

      setTutor(2);

      lvl.playerHeroName = "monk";
      lvl.playerLife = "60";
      lvl.botLife = "99999"
      lvl.playerCards =
        [
          { mnemonic: "pikeMiddle", price: "4" },
          { mnemonic: "shamanLow", price: "6" },
          { mnemonic: "panic", price: "4" }
        ];

      std_init(config, lvl, "map_monastery");
      const gManager = this.getServiceOrThrow(GameManager);
      const levelView = this.getServiceOrThrow(LevelView);
      const eField = this.getServiceOrThrow(EnemyFieldController);
      const signal = this.getServiceOrThrow(AttackSignalController);

      const monkGenerator = ObjectsCache.instance?.getObjectByPrefabName<MonkSummonerTileController>("MonkSummonerTilePrefab");

      if (monkGenerator != null && monkGenerator != undefined) {
        monkGenerator.start();
        gManager.fakeTiles.push(monkGenerator);
      }

      levelView.turnOffEnemySide();
      levelView.showTaskInfo();
      eField.playerLifeLine.show(false);
      eField.turnOffEffects();
      signal.activateEnemySide(false);

      setBotLevel(0.8, 1);
    });

    // lvl_walls
    specAlgs.set("lvl8", (config: LevelConfiguration, lvl: GameLevelCfgModel) => {

      std_init(config, lvl, "map_walls");
      setBotLevel(0.85, 1);

    });

    // lvl_lion_boss
    specAlgs.set("lvl10", (config: LevelConfiguration, lvl: GameLevelCfgModel) => {

      std_init(config, lvl, "map_lion");

    });

    // arena
    specAlgs.set("lvl_arena", (config, lvl: GameLevelCfgModel) => {

      configurateAudio();

      setMap(config, "map6");

      setBotLevel(1, 1);

      config.endLevelBonuses.length = 0;
      config.levelName = lvl.lvlName;

      const cardCfgs = this.getAvailableBonusesForArena(config, settingsLoader);

      const playerHero = this.configPlayerStd({ config, name: lvl.playerHeroName, life: Number(lvl.playerLife) });
      const botHero = this.configPlayerStd({ config, name: lvl.botHeroName, life: Number(lvl.botLife), isBot: true });

      if (!playerHero) return;
      if (!botHero) return;

      const bonuses = config.node
        .getChildByName("BonusModels")
        ?.getComponentsInChildren(BonusModel);

      assert(bonuses != null);

      const groupedBonuses = this.groupBonuses(bonuses, cardCfgs);

      const selectedBnses = this.selectBonuses(groupedBonuses);

      let bonusList = this.bonusesToList(selectedBnses)
        .map(c => ({ name: c.mnemonic, price: Number(c.price) }));

      this.addBonuses(config, botHero, bonusList);

      this.filterBonuses(groupedBonuses, selectedBnses);

      bonusList = this.bonusesToList(this.selectBonuses(groupedBonuses))
        .map(c => ({ name: c.mnemonic, price: Number(c.price) }));

      this.addBonuses(config, playerHero, bonusList);

      config.updateData();

      this._analitics.startLevel(lvl.lvlName);

    });

    settingsLoader.gameConfiguration.levels.forEach(lvl => {
      if (specAlgs.has(lvl.lvlName)) {
        this.configDict.set(lvl.lvlName, (config: LevelConfiguration) => {
          const func = specAlgs.get(lvl.lvlName);
          if (func) func(config, lvl);
        });
      } else {
        this.configDict.set(lvl.lvlName, (config: LevelConfiguration) => {
          std_init(config, lvl);
        });
      }
    });
  }

  getAvailableBonusesForArena(lvlConfig: LevelConfiguration, settingsLoader: SettingsLoader) {
    const bonuses = lvlConfig.bonuses;

    const gameCfg = settingsLoader.gameConfiguration;
    const curState = settingsLoader.playerCurrentGameState;
    const gameIsFinished = settingsLoader.playerCurrentGameState.isGameFinished();

    const resultBonuses = new Map<string, GameCardCfgModel>();

    const addBonus = (bc: GameCardCfgModel) => {
      const bonus = bonuses?.find(b => b.mnemonic == bc.mnemonic);
      if (bonus) {
        const bonusSameBase = bonuses?.filter(b =>
          b.baseCardMnemonic == bonus.baseCardMnemonic &&
          (b.bonusLevel <= bonus.bonusLevel || gameIsFinished));
        bonusSameBase?.forEach(b => {
          if (!resultBonuses.has(b.mnemonic)) {
            resultBonuses.set(b.mnemonic, { mnemonic: b.mnemonic, price: b.priceToActivate.toString() });
          }
        });
      }
    }

    curState.finishedLevels.forEach(lvlName => {
      const lvl = gameCfg.levels.find(v => v.lvlName == lvlName);
      if (lvl) {
        lvl.botCards.forEach(bc => {
          addBonus(bc);
        });
        if (lvl.endLevelBonus == 'onecard' || lvl.endLevelBonus == 'twocards') {
          lvl.endLevelBonusParams.forEach(p => {
            addBonus({ mnemonic: p.split(":")[0], price: p.split(":")[1] });
          })
        }
      }
    });

    curState.cards.forEach(bc => addBonus(bc));

    return Array.from(resultBonuses.values());
  }

  private loadPlayerState(config: LevelConfiguration,
    lvlCfg: GameLevelCfgModel,
    playerState: PlayerCurrentGameState,
    playerModel: PlayerModel
  ) {
    playerModel.life =
      lvlCfg.playerLife == "" ? playerState.life : Number(lvlCfg.playerLife);
    playerModel.lifeMax = playerModel.life;

    playerModel.playerName =
      lvlCfg.playerHeroName == "" ? playerState.hero : lvlCfg.playerHeroName;

    const bonuses: { name: string; price: number }[] = [];

    if (lvlCfg.playerCards.length > 0) {
      lvlCfg.playerCards.forEach((c) =>
        bonuses.push({ name: c.mnemonic, price: Number(c.price) })
      );
    } else {
      playerState.cards.forEach((c) =>
        bonuses.push({ name: c.mnemonic, price: Number(c.price) })
      );
    }

    if (bonuses.length > 0) {
      this.addBonuses(config, playerModel, bonuses);
    } else {
      playerModel.bonusesMetaData.length = 0;
      playerModel?.updateData();
    }
  }

  setEndBonusCard(config: LevelConfiguration, cardParams: string) {
    const cardUpBonus = config.node.getComponentInChildren(
      EndLevelCardUpdateBonusModel
    );

    if (cardUpBonus) {
      cardUpBonus.cardMnemonic = cardParams.split(":")[0];
      cardUpBonus.cardPrice = Number(cardParams.split(":")[1]);
      config.endLevelBonuses.push(cardUpBonus);
    }
  }

  setEndBonusTwoCards(config: LevelConfiguration, cardParams: string[]) {
    const cardsSelectorBonus = config.node.getComponentInChildren(
      EndLevelCardSelectorBonusModel
    );

    if (cardsSelectorBonus) {
      cardsSelectorBonus.cardOne = cardParams[0].split(":")[0];
      cardsSelectorBonus.cardOnePrice = Number(cardParams[0].split(":")[1]);

      cardsSelectorBonus.cardTwo = cardParams[1].split(":")[0];
      cardsSelectorBonus.cardTwoPrice = Number(cardParams[1].split(":")[1]);
      config.endLevelBonuses.push(cardsSelectorBonus);
    }
  }

  setEndBonusLife(config: LevelConfiguration, life: string) {
    const lifeBonus = config.node.getComponentInChildren(
      EndLevelLifeBonusModel
    );

    if (lifeBonus) {
      lifeBonus.life = life;
      config.endLevelBonuses.push(lifeBonus);
    }
  }

  addBonuses(
    config: LevelConfiguration,
    playerModel: PlayerModel | null,
    bonusCards: { name: string; price: number }[]
  ) {
    const bonuses = config.bonuses;

    if (playerModel) {
      playerModel.bonusesMetaData.length = 0;
    }

    bonusCards.forEach((bc) => {
      const bonusModel = bonuses?.find((bm) => bm.mnemonic == bc.name);

      if (bonusModel && playerModel) {
        if (bc.price > 0) bonusModel.priceToActivate = bc.price;
        playerModel.bonusesMetaData.push(bonusModel);
      }
    });

    playerModel?.updateData();
  }

  configPlayerStd({
    config,
    name,
    life = -1,
    isBot = false,
  }: {
    config: LevelConfiguration;
    name: string;
    life?: number;
    isBot?: boolean;
  }) {
    if (isBot) {
      config.botHeroName = name;
    } else {
      config.playerHeroName = name;
    }

    const player = this.findPlayerModel(config, name)

    if (player) {
      if (life > 0) {
        player.life = life;
        player.lifeMax = life;
      }

      return player;
    } else {
      return null;
    }
  }

  findPlayerModel(config: LevelConfiguration, name: string) {
    return config.node
      .getChildByName("HeroModels")!
      .getChildByName(LevelSelectorController.titleCaseWord(name) + "Hero")
      ?.getComponent(PlayerModel);
  }

  static titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substring(1);
  }

  bonusesToList(bonusGroup: { close_range: BonusGroupType | null, long_range: BonusGroupType | null, protect: BonusGroupType | null }) {
    const result = [];
    if (bonusGroup.close_range) result.push(bonusGroup.close_range.cardCfg);
    if (bonusGroup.long_range) result.push(bonusGroup.long_range.cardCfg);
    if (bonusGroup.protect) result.push(bonusGroup.protect.cardCfg);

    return result
  }

  selectBonuses(groupedBonuses: BonusGroups) {
    const result: { close_range: BonusGroupType | null, long_range: BonusGroupType | null, protect: BonusGroupType | null } =
      { close_range: null, long_range: null, protect: null };

    const rnd = (len: number) => {
      [0, 0, 0, 0].forEach(() => randomRangeInt(0, len));
      return randomRangeInt(0, len);
    }

    let ar = groupedBonuses.close_range;
    result.close_range = ar[rnd(ar.length)];

    ar = groupedBonuses.long_range;
    result.long_range = ar[rnd(ar.length)];

    ar = groupedBonuses.protect;
    result.protect = ar[rnd(ar.length)];

    return result;
  }

  filterBonuses(groupedBonuses: BonusGroups,
    filter: { close_range: BonusGroupType | null, long_range: BonusGroupType | null, protect: BonusGroupType | null }) {

    groupedBonuses.close_range = this.filterBonusesByType(groupedBonuses.close_range, filter.close_range);
    groupedBonuses.long_range = this.filterBonusesByType(groupedBonuses.long_range, filter.long_range);
    groupedBonuses.protect = this.filterBonusesByType(groupedBonuses.protect, filter.protect);
  }

  filterBonusesByType(bonusTypeLst: BonusGroupType[], filt: BonusGroupType | null) {
    if (filt == null) return [];

    return bonusTypeLst.filter(b => b.baseModel.bonusLevel == filt?.baseModel.bonusLevel);
  }

  getBonus(bonuses: BonusModel[], mnemonic: string) {
    return bonuses?.find(b => b.mnemonic == mnemonic);
  }

  groupBonuses(bonuses: BonusModel[], cards: GameCardCfgModel[]): BonusGroups {

    const result: BonusGroups = new BonusGroups();

    cards.forEach((card) => {

      const bonus = this.getBonus(bonuses, card.mnemonic);

      if (bonus) {
        switch (bonus.activateType) {
          case "close_range":
            result.close_range.push({ cardCfg: card, baseModel: bonus });
            break;
          case "long_range":
            result.long_range.push({ cardCfg: card, baseModel: bonus });
            break;
          case "protect":
            result.protect.push({ cardCfg: card, baseModel: bonus });
            break;
        }
      }
    });

    return result;
  }

}

class BonusGroups {
  close_range: BonusGroupType[] = [];
  long_range: BonusGroupType[] = [];
  protect: BonusGroupType[] = [];
}

class BonusGroupType {
  cardCfg: GameCardCfgModel;
  baseModel: BonusModel;
}

