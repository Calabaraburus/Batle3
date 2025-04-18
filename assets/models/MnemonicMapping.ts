//  MnemonicMapping.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MnemonicMapping")
export class MnemonicMapping {
  @property({})
  tileName = "tile";

  @property({})
  mnemonic = "mnem";
}
