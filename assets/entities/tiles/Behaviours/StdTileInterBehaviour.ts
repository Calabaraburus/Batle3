/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { director, _decorator, tween, randomRangeInt } from "cc";
import { interfaces } from "inversify";
import { TileModel } from "../../../models/TileModel";
import { helpers } from "../../../scripts/helpers";
import { GameBehaviour } from "../../behaviours/GameBehaviour";
import { FieldAnalyzer } from "../../field/FieldAnalizer";
import { GameManager } from "../../game/GameManager";
import { LevelController } from "../../level/LevelController";
import { CardService } from "../../services/CardService";
import { TileController } from "../TileController";
import { StdTileController } from "../UsualTile/StdTileController";
import { IAttackable, isIAttackable } from "../IAttackable";
import { LevelModel } from "../../../models/LevelModel";
import { MatchStatisticService } from "../../services/MatchStatisticService";
import { CardEffect } from "../../effects/CardEffect";
import { Behaviour } from "../../behaviours/Behaviour";
import { SoulEffect } from "../../effects/soulEffect";
import { EffectsManagerForBot } from "../../../bot/EffectsManagerForBot";
import { ToScreenResizer } from "../../ui/ToScreenResizer";

const { ccclass } = _decorator;

/**
 * Implements behaviour for simple tiles
 */
@ccclass("StdTileInterBehaviour")
export class StdTileInterBehaviour extends GameBehaviour {
  //private _cardsService: CardService | null;

  //  start() {
  // super.start();
  // this._cardsService = this.getService(CardService);
  // this._levelModel = this.getService(LevelModel);
  // this._matchStatistic = this.getService(MatchStatisticService);
  //}
  private _doNotUpdateMana = false;
  private _tileCrashSoundNames = ["tilesCrash", "tilesCrash2"];
  private _soulSoundNames = ["soulEnd", "soulEnd2", "soulEnd3", "soulEnd4"];
  private _tileCrashSoundNo = 0;

  private readonly MaxStars = 6;

  public get doNotUpdateMana(): boolean {
    return this._doNotUpdateMana;
  }

  public set doNotUpdateMana(value: boolean) {
    this._doNotUpdateMana = value;
  }

  constructor() {
    super();
    this.type = helpers.typeName(StdTileController);
  }

  activateCondition(): boolean {
    const model = this.currentPlayerModel;
    return model != null ? !model.isBonusSet() : false;
  }

  singleRun(): void {
    this.debug?.log(`[behaviour][tilesBehaviour] stop iterate over behaves`);

    this._inProcess = true;
    const tile = this.target as StdTileController;

    if (tile == undefined || tile == null) {
      throw Error("[behaviour][tileBehaviour] tile cant be undefined or null");
    }

    if (tile.playerModel == this.currentPlayerModel) {
      this._inProcess = false;
      return
    }

    if (tile.shieldIsActivated) {
      this._inProcess = false;
      return;
    }

    this.debug?.log(
      `[behaviour][tilesBehaviour] try to get connected tiles for r:${tile.row}, c:${tile.col}`
    );

    const connectedTiles = this.fieldAnalizer?.getConnectedTiles(tile);

    if (connectedTiles == undefined || connectedTiles == null) {
      this.debug?.log(
        `[behaviour][tilesBehaviour] Error connected tiles is null or undefined`
      );
      this._inProcess = false;
      return;
    }

    if (connectedTiles.length == 0) {
      this.debug?.log(
        `[behaviour][tilesBehaviour] there is no connected tiles`
      );
      this._inProcess = false;
      return;
    }

    this.debug?.log(`[behaviour][tilesBehaviour] try to destroy tiles`);

    let tilesCount = 0;

    const tilesToDestroy: StdTileController[] = [];

    connectedTiles.forEach((item) => {
      if (item instanceof StdTileController) {
        if (!item.shieldIsActivated) {
          tilesToDestroy.push(item);
          this.BeforeDestroy(item);
          this.DestroyTile(item);

          tilesCount++;
        }
      } else {
        //this.field?.fakeDestroyTile(item);
      }
    });

    if (tilesCount > 0) {
      this.manaUpdate(tilesCount, connectedTiles[0].tileModel);
      this.eotInvoker.endTurn();

      if (!(this.effectsManager instanceof EffectsManagerForBot)) {
        this.effectsManager
          .PlayEffectNow(() => {
            this.effect(tilesToDestroy);
          }, 0.5).PlayEffect(() => this.updateTileField(), 0.5);
      }
    }

    this.debug?.log(`[behaviour][tilesBehaviour] update tile field`);

    this._inProcess = false;
  }

  private DestroyTile(tile: TileController): void {
    this.field?.fakeDestroyTile(tile);
  }

  private BeforeDestroy(tile: TileController): void {
    const tiles = [
      this.getTile(tile.row + 1, tile.col),
      this.getTile(tile.row - 1, tile.col),
      this.getTile(tile.row, tile.col + 1),
      this.getTile(tile.row, tile.col - 1),
    ];

    tiles.forEach((t) => {
      if (isIAttackable(t)) {
        if (t.playerModel == this.currentOponentModel) {
          (<IAttackable>t).attack(1);
        }
      }
    });
  }

  effect(tiles: TileController[]): boolean {
    console.log("tiles destroy effect");
    const timeObj = { time: 0 };
    const animator = tween(timeObj);
    const effects: CardEffect[] = [];
    const cards = this.dataService.playerFieldController.cardField.cards;
    // this.parent.audioManager.playSoundEffect("firewall");
    const resizer = this.getServiceOrThrow(ToScreenResizer);

    const getCard = (tileTags: string[]) => {
      const c = cards.filter((c) => tileTags.includes(c.model.activateType));
      return c.length <= 0 ? null : c[0];
    }

    animator.call(() => {

      this.audioManager.playSoundEffect(this._tileCrashSoundNames[this._tileCrashSoundNo]);
      this._tileCrashSoundNo = (this._tileCrashSoundNo >= this._tileCrashSoundNames.length - 1) ?
        0 : this._tileCrashSoundNo + 1;

      let soulSoundIsPLayed = false;

      tiles.forEach((t, i) => {

        const effect =
          this.objectsCache.getObjectByPrefabName<CardEffect>("TilesCrushEffect");

        if (effect == null) {
          return;
        }

        effect.node.parent = null;
        effect.node.parent = t.node.parent;
        effect.node.position = t.node.position.clone();
        effect.play();

        effects.push(effect);

        t.node.active = false;

        if (t.playerModel == this.botModel && this.currentPlayerModel == this.playerModel) {

          const card = getCard(t.tileModel.getTags())

          if (card && i <= this.MaxStars) {
            const soulEffect =
              this.objectsCache.getObjectByPrefabName<SoulEffect>("tileSoulEffect");

            if (soulEffect) {

              if (!soulSoundIsPLayed) {
                this.audioManager.playSoundEffect("soulSound");
                soulSoundIsPLayed = true;
              }

              soulEffect.node.parent = this.effectsService.effectsNode;
              soulEffect.node.worldPosition = t.node.worldPosition;
              soulEffect?.playSoul(card.node, () => {
                card.PlaySoulEffect();
              });
            }
          }
        }

      });
    });

    animator
      .delay(2)
      .call(() => effects.forEach((e) => e.cacheDestroy()));

    animator.start();
    return true;
  }

  /*  private createParticles() {
      const ps = instantiate(this.destroyPartycles);
      ps.parent = this.node.parent;
      const ui = this.getComponent(UITransform);
  
      if (ui == null) {
        return;
      }
  
      ps.position = new Vec3(
        this.node.position.x + ui.contentSize.width / 2,
        this.node.position.y + ui.contentSize.height / 2,
        this.node.position.z
      );
    }
  */

  private getTile(row: number, col: number): TileController | null {
    const m = this.field?.fieldMatrix;
    if (m == undefined) {
      return null;
    }

    if (row >= m.rows || row < 0 || col >= m.cols || col < 0) {
      return null;
    }

    return m.get(row, col);
  }

  private updateTileField() {
    const analizedData = this.fieldAnalizer?.analyze();

    if (analizedData != null) {
      this.field?.moveTilesLogicaly(!this.gameState.isPlayerTurn);
      this.field?.fixTiles();
      this.field?.flush();
      this.fieldViewController.moveTilesAnimate();
    }
  }

  manaUpdate(tilesCount: number, tileType: TileModel): void {
    if (this._doNotUpdateMana) {
      return;
    }

    const curPlayerModel = this.currentPlayerModel;
    if (curPlayerModel == null) return;
    if (this.levelModel.gameMechanicType == 0) {
      curPlayerModel.manaCurrent +=
        tilesCount > 6 ? (tilesCount > 10 ? 3 : 2) : 1;
    } else {
      const tbonuses = curPlayerModel.bonuses.filter((b) =>
        tileType.containsTag(b.activateType)
      );

      tbonuses.forEach(
        (b) =>
        (b.currentAmmountToActivate +=
          tilesCount > 6 ? (tilesCount > 10 ? 3 : 2) : 1)
      );
    }
  }

  clone(): Behaviour {
    const result = new StdTileInterBehaviour();
    this.cloneInternal(result);
    result._doNotUpdateMana = this.doNotUpdateMana;

    return result;
  }
}
