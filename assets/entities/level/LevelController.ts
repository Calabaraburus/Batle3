//  LevelController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { director, _decorator, Node } from "cc";
import { BonusModel } from "../../models/BonusModel";
import { LevelModel } from "../../models/LevelModel";
import { EnemyFieldController } from "../enemyField/EnemyFieldController";
import { FieldController } from "../field/FieldController";
import { PlayerFieldController } from "../playerField/PlayerFieldController";
import type { ILevelView } from "./ILevelView";
import { LevelView } from "./LevelView";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { AttackSignalController } from "../attackSignal/AttackSignalController";
import { Service } from "../services/Service";
import { SettingsLoader } from "../services/SettingsLoader";
const { ccclass, property } = _decorator;

/** Controls level view. */
@ccclass("LevelController")
export class LevelController extends Service {

  /** Level view */
  @property({ type: LevelView })
  view: ILevelView;

  /** Level model */
  @property({ type: LevelModel })
  model: LevelModel;

  /** Field Controller */
  @property({ type: FieldController })
  fieldController: FieldController;

  /** Player model */
  @property({ type: LevelConfiguration })
  levelConfiguration: LevelConfiguration;

  @property(PlayerFieldController)
  playerField: PlayerFieldController;

  @property(EnemyFieldController)
  enemyField: EnemyFieldController;

  @property(AttackSignalController)
  signalController: AttackSignalController;

  @property(Node)
  serviceBtn: Node;

  start() {
    this.model = this.getServiceOrThrow(LevelModel);
    this.levelConfiguration = this.getServiceOrThrow(LevelConfiguration);
    this.view.setController(this);

    const settingsLoader = this.getServiceOrThrow(SettingsLoader);

    this.serviceBtn.active = settingsLoader.gameParameters.editMode;

    this.updateData();
  }

  public showWinView(show: boolean) {
    this.view.showWin(show);
  }

  public showLoseView(show: boolean) {
    this.view.showLose(show);
  }

  public lockTuch(lock: boolean) {
    this.view.lockTuch(lock);
  }

  public updateData() {
    this.playerField.playerModel = this.levelConfiguration.playerModel;
    this.enemyField.playerModel = this.levelConfiguration.botModel;
    this.view.AimPoints = this.model.aimPoints;
    // this.view.TurnsCount = this.model.turnsCount;
    // this.view.PointsCount = this.model.pointsCount;

    this.playerField.updateData();
    this.enemyField.updateData();
    //   this.attackSignal.updateData();
  }

  public resetGame() {
    director.loadScene("scene1");
    //this.model.pointsCount = 0;
    //this.model.turnsCount = this._turnsCount;

    //this.updateData();

    //this.fieldController.Reset();
  }

  public setBonus(name: string) {
    const bonus = new BonusModel();
    // bonus.price = 15;
    // bonus.type = this.fieldController.fieldModel.getTileModel("bomb");
    this.fieldController.setBonus(bonus);
  }
}
