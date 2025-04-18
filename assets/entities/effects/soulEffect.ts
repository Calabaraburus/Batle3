import { _decorator, assert, Component, math, Node, tween, UIOpacity, Vec3 } from 'cc';
import { CardEffect } from './CardEffect';
const { ccclass, property } = _decorator;

@ccclass('SoulEffect')
export class SoulEffect extends CardEffect {
    private _starOpacity: UIOpacity | null;

    @property(Node)
    starNode: Node;

    dispertion1 = 100;

    dispertion2 = 50;

    start() {

    }

    playSoul(aim: Node, effectEnds: () => void): void {

        if (!this._starOpacity) {
            this._starOpacity = this.starNode.getComponent(UIOpacity);
            assert(this._starOpacity != null);
        }

        const p = this.node.worldPosition.clone();

        p.x += math.randomRange(-this.dispertion1, this.dispertion1);
        p.y += math.randomRange(-this.dispertion1, this.dispertion1);

        const p2 = aim.worldPosition.clone();

        p2.x += math.randomRange(-this.dispertion2, this.dispertion2);
        p2.y += math.randomRange(-this.dispertion2, this.dispertion2);

        this.play();
        this._starOpacity.opacity = 255;
        this._starOpacity.node.setRotationFromEuler(
            new Vec3(0, 0, math.randomRange(0, 360)));

        tween(this.node)
            .to(0.3, { worldPosition: p }, { easing: "cubicOut" })
            .to(math.randomRange(0.5, 0.8), { worldPosition: p2 }, { easing: "cubicIn" })
            .call(() => {
                this.stopEmmit();
                effectEnds();
                tween(this._starOpacity).to(0.5, { opacity: 0 }).start();
            }).delay(1).call(() => {
                this.stop()
                this.cacheDestroy()
            })
            .start();

    }

}


