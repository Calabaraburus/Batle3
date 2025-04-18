//  BombTileController.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, Node, CCInteger } from "cc";
import { TileController } from "../TileController";
const { ccclass, property } = _decorator;

@ccclass("BombTileController")
export class BombTileController extends TileController {
  @property(Node)
  bombSpriteNode: Node;

  @property(CCInteger)
  fireDistance = 2;

  destroyTile() {
    super.fakeDestroy();
    this.bombSpriteNode.active = false;
  }
}
