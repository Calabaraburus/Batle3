import { _decorator, assert, CCFloat, CCString, Component, director, math, Node, tween, UIOpacity } from 'cc';
import { ObjectsCache } from '../../../ObjectsCache/ObjectsCache';
import { loseLifeLabel } from './loseLifeLabel';
import { Service } from '../../services/Service';
import { EffectsManager } from '../../game/EffectsManager';
import { AudioManagerService } from '../../../soundsPlayer/AudioManagerService';
const { ccclass, property } = _decorator;

@ccclass('LoseLifeEffect')
export class LoseLifeEffect extends Service {
    private _opacity: UIOpacity;
    @property(CCFloat)
    effectSpeed: number = 4;

    @property(CCString)
    soundEffectName = "hitSound1";

    private _effectsManager: EffectsManager;
    private _lvlViewNode: Node;
    private _audioMgr: AudioManagerService;
    private _canPlayAudio = true;

    protected start(): void {
        const t = this.node.getComponent(UIOpacity);
        this._effectsManager = this.getServiceOrThrow(EffectsManager);
        this._audioMgr = this.getServiceOrThrow(AudioManagerService);

        assert(t != null);

        this._opacity = t;
        this._opacity.opacity = 0;

        const tlvlViewNode = director.getScene()?.getChildByName("LevelView");
        if (tlvlViewNode) {
            this._lvlViewNode = tlvlViewNode;
        }
    }

    playEffect(life: number) {
        if (ObjectsCache.instance) {
            this._effectsManager.PlayEffectNow(() => { }, 1);

            if (this._canPlayAudio) {
                this._audioMgr.playSoundEffect(this.soundEffectName);
                this._canPlayAudio = false;
                tween(this).delay(1).call(() => this._canPlayAudio = true).start();
            }

            const label = ObjectsCache.instance.getObjectByName<loseLifeLabel>("loseLifeLabel");
            if (label) {
                label.node.parent = null;
                label.node.parent = this._lvlViewNode;
            }
            const pos = this.node.worldPosition.clone();
            pos.x += math.randomRange(-50, 50);
            pos.y += math.randomRange(-50, 50);
            label?.play(life, pos);
            this._opacity.opacity = 255;
        }
    }

    protected update(dt: number): void {
        if (this._opacity.opacity > 0) {
            this._opacity.opacity -= this.effectSpeed;
        }
    }
}


