//  IBot.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { PlayerModel } from "../models/PlayerModel";

export interface IBot {

  get botModel(): PlayerModel;

  move(): void;
}
