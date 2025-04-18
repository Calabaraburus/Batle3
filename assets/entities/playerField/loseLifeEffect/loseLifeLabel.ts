import { _decorator, Component, Label, Node, tween, Vec3, math } from 'cc';
import { CacheObject } from '../../../ObjectsCache/CacheObject';
const { ccclass, property } = _decorator;

@ccclass('loseLifeLabel')
export class loseLifeLabel extends CacheObject {
    @property(Label)
    label: Label;

    play(life: number, pos: Vec3) {
        this.label.string = life.toString();
        const toPos = pos.clone();
        toPos.x += math.randomRange(-80, 80);
        toPos.y += math.randomRange(150, 200);
        tween(this.node)
            .set({ worldPosition: pos })
            .to(1.5, { worldPosition: toPos }, { easing: "cubicOut" })
            .call(() => this.cacheDestroy()).start();
    }
}


