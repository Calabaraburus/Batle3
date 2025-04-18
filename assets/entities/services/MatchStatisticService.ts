import { _decorator, Component, Node } from "cc";
import { Service } from "./Service";
import { TileController } from "../tiles/TileController";
import { TileModel } from "../../models/TileModel";
import { WinGameMenu } from "../menu/WinGameMenu";
import { LoseGameMenu } from "../menu/LoseGameMenu";
const { ccclass, property } = _decorator;

@ccclass("MatchStatisticService")
export class MatchStatisticService extends Service {
  playerStat: any = {};
  enemyStat: any = {};

  startTileStatistic() {
    this.playerStat = {
      tilesNumber: 0,
      swordNumber: 0,
      bowNumber: 0,
      shieldNumber: 0,
    };
    this.enemyStat = {
      tilesNumber: 0,
      swordNumber: 0,
      bowNumber: 0,
      shieldNumber: 0,
    };
  }

  updateTapTileStatistic(tilesNumber: number, typeTile: TileModel) {
    switch (typeTile.tileName) {
      case "b":
        this.playerStat.tilesNumber += tilesNumber;
        this.playerStat.swordNumber += tilesNumber;
        break;
      case "k":
        this.playerStat.tilesNumber += tilesNumber;
        this.playerStat.bowNumber += tilesNumber;
        break;
      case "g":
        this.playerStat.tilesNumber += tilesNumber;
        this.playerStat.shieldNumber += tilesNumber;
        break;
      case "r":
        this.enemyStat.tilesNumber += tilesNumber;
        this.enemyStat.swordNumber += tilesNumber;
        break;
      case "p":
        this.enemyStat.tilesNumber += tilesNumber;
        this.enemyStat.bowNumber += tilesNumber;
        break;
      case "y":
        this.enemyStat.tilesNumber += tilesNumber;
        this.enemyStat.shieldNumber += tilesNumber;
        break;
    }
  }

  loadStatistic(state: string) {
    let endMenu = this.getService(WinGameMenu);
    if (state == "lose") {
      endMenu = this.getService(LoseGameMenu);
    }
    if (!endMenu) return;
    endMenu?.updateStatistic(this.playerStat, this.enemyStat);
  }
}
