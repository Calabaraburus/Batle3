import {
  _decorator,
  assert,
  Button,
  Color,
  Label,
  Material,
  math,
  Node,
  Quat,
  RichText,
  Sprite,
  SpriteFrame,
  tween,
  Tween
} from "cc";
import { BonusModel } from "../../models/BonusModel";
import { Service } from "../services/Service";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { EndLevelLifeBonusModel } from "../configuration/EndLevelLifeBonusModel";
import { EndLevelCardUpdateBonusModel } from "../configuration/EndLevelCardUpdateBonusModel";
import { EndLevelCardSelectorBonusModel } from "../configuration/EndLevelCardSelectorBonusModel";
import { SettingsLoader } from "../services/SettingsLoader";
import { PlayerCurrentGameState } from "../services/PlayerCurrentGameState";
import { OverlayWindow } from "../menu/OverlayWindow";
import { Window } from "../ui/window/Window";
import { EndLevelBonusModel } from "../configuration/EndLevelBonusModel";
import { SceneLoaderService } from "../services/SceneLoaderService";
import { config } from "chai";
import { InfoWindow } from "../ui/window/InfoWindow";
import { t } from "../../../extensions/i18n/assets/LanguageData";
import { AudioConfigurator } from "../services/AudioConfigurator";
import { InGameLevelLoaderService } from "../level/InGameLevelLoaderService";
import { Analitics } from "../../scripts/analitics/Analitics";

const { ccclass, property } = _decorator;

@ccclass("FinalWindow")
export class FinalWindow extends Service {
  @property(Node)
  backCard: Node;

  @property(Node)
  cardUp: Node;

  @property(Node)
  cardChoice: Node;

  @property(Node)
  life: Node;

  @property(Node)
  rewardGroup: Node;

  @property(Node)
  nextBtnNode: Node;

  @property(Material)
  materialForDisables: Material = new Material();

  @property(Material)
  defaultMaterial = new Material();

  @property(SpriteFrame)
  crystalSprites: SpriteFrame[] = [];

  @property(Label)
  finalText: Label;

  //@property(Color)
  colorForDisables: math.Color = Color.GRAY;

  //@property(Color)
  colorForEnables: math.Color = Color.WHITE;

  private _isInit = false;
  private _config: LevelConfiguration;
  private _bonusOperations = new Map<{ new(): EndLevelBonusModel },
    {
      init: (bonus: EndLevelBonusModel) => void,
      open: (bonus: EndLevelBonusModel) => void,
      close: (bonus: EndLevelBonusModel) => void
    }>;

  bonusLife: string;

  private _cardImageOne: Sprite | null | undefined;
  private _cardImageTwo: Sprite | null | undefined;
  private _cardFlagSelector: string;

  private _settingsLoader: SettingsLoader;
  private _state: PlayerCurrentGameState;

  timeTurn = 0.6;

  private _selectedBonus: { name: string, price: string } = { name: "", price: "" };
  private _wndIsClosed = false;
  private _overlayWnd: OverlayWindow | null;
  private _wnd: Window | null;
  private _infoWnd: InfoWindow;
  private _audio: AudioConfigurator;
  private _inGameLoader: InGameLevelLoaderService | null;
  private _analitics: Analitics;

  start() {
    this._config = this.getServiceOrThrow(LevelConfiguration);
    this._overlayWnd = this.getComponent(OverlayWindow);
    this._wnd = this.getComponent(Window);
    this._inGameLoader = this.getService(InGameLevelLoaderService);
    this._infoWnd = this.getServiceOrThrow(InfoWindow);
    this._audio = this.getServiceOrThrow(AudioConfigurator);
    this._cardFlagSelector = "empty";
    this._wndIsClosed = true;
    const tService = this.getService(SettingsLoader);

    this._analitics = new Analitics();

    assert(tService != null, "SettingsLoader can't be found");

    this._settingsLoader = tService;

    this._state = this._settingsLoader.playerCurrentGameState;

    this._bonusOperations.set(EndLevelLifeBonusModel, {
      init: (bonus) => {
        if (bonus instanceof EndLevelLifeBonusModel) {
          this.bonusLife = bonus.life;

          this.initLife();
        }
      },
      open: () => {

      }, close: () => {
        this.addLifeToCurrentState();
      }
    });
    this._bonusOperations.set(EndLevelCardUpdateBonusModel, {
      init: (bonus) => {
        if (bonus instanceof EndLevelCardUpdateBonusModel) {
          this.initCardUp(bonus);
        }
      },
      open: () => {

      }, close: (bonus) => {
        if (bonus instanceof EndLevelCardUpdateBonusModel) {
          this.addBonusToCurrentState(bonus.cardMnemonic, bonus.cardPrice.toString());
        }
      }
    });
    this._bonusOperations.set(EndLevelCardSelectorBonusModel, {
      init: (bonus) => {
        if (bonus instanceof EndLevelCardSelectorBonusModel) {
          this.initCardSelector(bonus);
        }
      },
      open: () => {

      },
      close: () => {
        const sBonus = this._config?.getBonus(this._selectedBonus.name);
        if (sBonus) {

          let bonusIsUpdated = false;
          // try to update bonus
          bonusIsUpdated = this.tryToUpdateBonus(sBonus, this._selectedBonus.price);

          if (!bonusIsUpdated) {
            this.addBonusToCurrentState(this._selectedBonus.name, this._selectedBonus.price);
          }
        }
      }
    });

    this.initBonuses();

    this.setScenarioTxt();

    this._isInit = true;
  }

  setScenarioTxt() {
    this.finalText.string = t(`levels.${this._config.levelName}.ending`);
  }

  canUpdateCurStateData() {
    return !this._state.levelExists(this._config.levelName);
  }

  private tryToUpdateBonus(sBonus: BonusModel, price: string) {
    if (!this.canUpdateCurStateData()) {
      return false;
    }

    let bonusIsUpdated: boolean = false;

    this._state.cards.forEach(c => {
      const b = this._config?.getBonus(c.mnemonic);
      if (b != null && b.activateType == sBonus.activateType) {
        c.mnemonic = sBonus.mnemonic;
        c.price = price;
        bonusIsUpdated = true;
      }
    });
    return bonusIsUpdated;
  }

  private addLifeToCurrentState() {
    if (!this.canUpdateCurStateData()) {
      return false;
    }

    this._state.life += parseFloat(this.bonusLife);
  }

  private addBonusToCurrentState(mnemonic: string, price: string) {
    if (!this.canUpdateCurStateData()) {
      return false;
    }

    this._state.cards.push({ mnemonic: mnemonic, price: price });
  }

  initBonuses() {
    this._config?.endLevelBonuses.forEach(b => {
      const operations = this._bonusOperations.get(b.constructor);
      operations?.init(b);
    });
  }

  closeBonusEvents() {
    this._config?.endLevelBonuses.forEach(b => {
      const operations = this._bonusOperations.get(b.constructor);
      operations?.close(b);
    });
  }

  showWindowTst() {
    this.showWindow();
  }

  rewardNextPress() {
    this._wnd?.showContentGroup('win');
  }

  showWindow(win: boolean = true) {
    if (this._isInit) {
      this.start();
      this._wnd?.start();
    }

    this._overlayWnd?.showWindow();

    this._audio.audioManager.stopMusic();

    if (win) {

      this._analitics.finishLevelWin(this._config.levelName);

      tween(this).delay(3).call(() => {
        if (!this._wndIsClosed) {
          this._audio.applyList(this._audio.endGameMusicList);
        }
      }).start();

      this._audio.audioManager.playSoundEffect("victory", false);

      if (this._config.endLevelBonuses.length > 0 &&
        this.canUpdateCurStateData()) {
        this._wnd?.showContentGroup('reward');
      } else {
        this._wnd?.showContentGroup('win');
      }
    } else {
      this._analitics.finishLevelLose(this._config.levelName);
      this._wnd?.showContentGroup('lose');
      tween(this).delay(9).call(() => {
        if (!this._wndIsClosed) {
          this._audio.applyList(this._audio.endGameMusicList);
        }
      }).start();
      this._audio.audioManager.playSoundEffect("defeated", false);
    }

    this._wndIsClosed = false;
  }

  hideWindow() {
    this._overlayWnd?.hideWindow();
  }

  initLife() {
    const lifeNum = this.life.getChildByName("Number")?.getComponent(Label);
    if (!lifeNum) return;
    lifeNum.string = "+" + this.bonusLife;
    this.life.active = true;
  }

  initCardUp(bonus: EndLevelCardUpdateBonusModel) {
    const cardImage = this.cardUp
      .getChildByName("CardPlace")
      ?.getComponent(Sprite);

    const crystalSprite = this.cardUp
      .getChildByName("crystal")
      ?.getComponent(Sprite);

    const bonusModelUp = this._config?.getBonus(bonus.cardMnemonic);

    if (!cardImage) return;
    if (!bonusModelUp) return;
    if (!crystalSprite) return;
    this.cardUp.active = true;
    cardImage.spriteFrame = bonusModelUp.sprite;
    this.updateLevelSprite(bonusModelUp, crystalSprite);
  }

  initCardSelector(bonus: EndLevelCardSelectorBonusModel) {

    const bonusModelSelectorOne = this._config?.getBonus(bonus.cardOne);
    const bonusModelSelectorTwo = this._config?.getBonus(bonus.cardTwo);

    this._cardImageOne = this.cardChoice
      .getChildByName("CardOne")
      ?.getComponent(Sprite);

    this._cardImageTwo = this.cardChoice
      .getChildByName("CardTwo")
      ?.getComponent(Sprite);

    assert(this._cardImageOne != null);
    assert(this._cardImageTwo != null);

    const crystalSprite1 = this._cardImageOne.node
      .getChildByName("crystal")
      ?.getComponent(Sprite);

    const crystalSprite2 = this._cardImageTwo.node
      .getChildByName("crystal")
      ?.getComponent(Sprite);

    assert(crystalSprite1 != null);
    assert(crystalSprite2 != null);

    this.updateLevelSprite(bonusModelSelectorOne, crystalSprite1);
    this.updateLevelSprite(bonusModelSelectorTwo, crystalSprite2);

    this.cardChoice.active = true;
    this._cardImageOne.spriteFrame = bonusModelSelectorOne.sprite;
    this._cardImageTwo.spriteFrame = bonusModelSelectorTwo.sprite;

    const c1Node = this._cardImageOne.node;
    const c2Node = this._cardImageTwo.node;

    let enableCard = (s: Sprite | null | undefined, enable = true) => {
      if (s != null) {
        s.material = enable ? this.defaultMaterial : this.materialForDisables;
        s.color = enable ? this.colorForEnables : this.colorForDisables;
      }

    };

    enableCard = enableCard.bind(this);

    enableCard(this._cardImageOne, false);
    enableCard(this._cardImageTwo, false);

    const selectCard = (s: Sprite | null | undefined) => {
      const otherS = s == this._cardImageOne ? this._cardImageTwo : this._cardImageOne;

      this._selectedBonus.name = s == this._cardImageOne ? bonus.cardOne : bonus.cardTwo;
      this._selectedBonus.price = s == this._cardImageOne ?
        bonus.cardOnePrice.toString() :
        bonus.cardTwoPrice.toString();

      enableCard(s);
      enableCard(otherS, false);

      this.nextBtnNode.active = true;
    };

    c1Node.off(Node.EventType.TOUCH_START);
    c2Node.off(Node.EventType.TOUCH_START);

    c1Node.on(Node.EventType.TOUCH_START, () => selectCard(this._cardImageOne), this)
    c2Node.on(Node.EventType.TOUCH_START, () => selectCard(this._cardImageTwo), this)

    const b1Node = this.getInfoButton(c1Node).node;
    const b2Node = this.getInfoButton(c2Node).node;

    b1Node.off(Node.EventType.TOUCH_START);
    b2Node.off(Node.EventType.TOUCH_START);

    b1Node.on(Node.EventType.TOUCH_START,
      () => {
        this._infoWnd.showWindow(null);
        this._infoWnd.showBonusInfo(bonusModelSelectorOne);
      });

    b2Node.on(Node.EventType.TOUCH_START,
      () => {
        this._infoWnd.showWindow(null);
        this._infoWnd.showBonusInfo(bonusModelSelectorTwo);
      });

    this.nextBtnNode.active = false;
  }

  getInfoButton(target: Node) {
    const result = target.getComponentInChildren(Button);
    assert(result != null);
    return result;
  }

  closeFinalWindow() {
    if (this.canUpdateCurStateData()) {
      this.closeBonusEvents();

      this._state.addLevel(this._config.levelName);

      if (this._state.life == null) {
        const cfgLvl = this._settingsLoader.gameConfiguration.levels.find(l => l.lvlName == this._config.levelName);

        if (cfgLvl) {
          this._state.life = Number(cfgLvl.playerLife);
        }
      }

      this._settingsLoader.saveGameState();
    }

    this._wndIsClosed = true;
    this._inGameLoader?.loadScene(this, "LvlScene");
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
}
