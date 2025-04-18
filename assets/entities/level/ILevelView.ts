//  ILevelView.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { Sprite, SpriteFrame } from "cc";
import { LevelController } from "./LevelController";

export interface ILevelView {
  /** Turns count */
  TurnsCount: number;

  /** Aimponts */
  AimPoints: number;

  /** Ponts count */
  PointsCount: number;

  /** bonus price 1 label */
  Bonus1Price: number;

  /** bonus price 2 label */
  Bonus2Price: number;

  /** bonus price 3 label */
  Bonus3Price: number;

  setController(controller: LevelController): void;

  showWin(show: boolean): void;

  showLose(show: boolean): void;

  lockTuch(lock: boolean): void;
}
