//  LevelView.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  Button,
  CCFloat,
  Component,
  Label,
  Node,
  Sprite,
  SpriteFrame,
  UIOpacity,
  Vec3,
  _decorator,
  assert,
} from "cc";
import { LevelModel } from "../../models/LevelModel";
import { ILevelView } from "./ILevelView";
import { LevelController } from "./LevelController";
import { MatchStatisticService } from "../services/MatchStatisticService";
import { Window } from "../ui/window/Window";
import { FinalWindow } from "../rewardBlock/FinalWindow";
import { TaskInfo } from "../ui/taskInfo/TaskInfo";
const { ccclass, property } = _decorator;

@ccclass("LevelView")
export class LevelView extends Component implements ILevelView {
  Bonus1Price: number;
  Bonus2Price: number;
  Bonus3Price: number;

  statisticService: MatchStatisticService;

  private _model: LevelModel;
  private _controller: LevelController;
  private _aimPoints = 0;
  private _enemyMaxLife = 0;
  private _playerMaxLife = 0;
  private _pointsCount = 0;
  private _lightsBkgStackUp: Node | null

  /** Turns count label */
  @property({ type: Label })
  turnsCountLbl: Label;

  /** Points count label */
  @property({ type: Label })
  pointsCountLbl: Label;

  /** Win block */
  @property({ type: FinalWindow })
  finalWindow: FinalWindow;

  /** Object wich lock interctions with field */
  @property({ type: Button })
  touchLockObject: Button;

  /** Load line min pos */
  @property({ type: CCFloat })
  loadLineZeroPos = 0;

  /** Load line max pos */
  @property({ type: CCFloat })
  loadLineEndPos = 1;
  private _enemySignalBlock: Node | null;


  //#region IListView

  public get TurnsCount(): number {
    return Number(this.turnsCountLbl.string);
  }
  public set TurnsCount(value: number) {
    this.turnsCountLbl.string = value.toString();
  }

  public get AimPoints(): number {
    return this._aimPoints;
  }
  public set AimPoints(value: number) {
    this._aimPoints = value;
  }

  public get PointsCount(): number {
    return Number(this.pointsCountLbl.string);
  }
  public set PointsCount(value: number) {
    this.pointsCountLbl.string = value.toString();
    this._pointsCount = value;
  }

  getSignalNodes(): void {
    this._lightsBkgStackUp = this.node.getChildByPath("MainField/TilesFieldFrame/up/stack");
    this._enemySignalBlock = this.node.getChildByPath("MainField/AttackSignalBlock/enemySide");
  }

  public turnOffEnemySide(turnOff = true) {
    this.getSignalNodes();
    assert(this._lightsBkgStackUp != null);
    assert(this._enemySignalBlock != null);

    this._lightsBkgStackUp.active = !turnOff;
    var opacity = this._enemySignalBlock.getComponent(UIOpacity);

    assert(opacity != null);

    if (turnOff) {
      opacity.opacity = 0;
    } else {
      opacity.opacity = 255;
    }
  }

  public showTaskInfo(show = true) {
    const ti = this.node.getComponentInChildren(TaskInfo);
    assert(ti != null);

    ti.show(show);
  }

  public showWin(show: boolean) {
    if (show) {
      this.finalWindow.showWindow(true);
    }
    else {
      this.finalWindow.hideWindow();
    }
  }

  public showLose(show: boolean) {
    if (show) {
      this.finalWindow.showWindow(false);
    }
    else {
      this.finalWindow.hideWindow();
    }
  }

  //#endregion

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public pause(show: boolean): void {
    throw new Error("This method is abstract");
  }

  public bonusBtnClick(bonusName: string) {
    this._controller.setBonus(bonusName);
  }

  public lockTuch(lock: boolean) {
    this.touchLockObject.node.active = lock;
  }

  public resetGame() {
    this.showWin(false);
    this.showLose(false);
    this._controller.resetGame();
  }

  public setController(controller: LevelController): void {
    this._controller = controller;
  }
}


