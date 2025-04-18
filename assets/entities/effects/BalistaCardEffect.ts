import { _decorator, ParticleSystem, Node } from "cc";
import { CardEffect } from "./CardEffect";
const { ccclass, property } = _decorator;

@ccclass("BalistaCardEffect")
export class BalistaCardEffect extends CardEffect {
  private isplaying = false;

  @property({ type: Node })
  arrowSpriteNode: Node;

  @property({ type: Node })
  aim: Node;
}
