import { Queue } from "../../scripts/Queue";
import { Service } from "../services/Service";
import { _decorator } from "cc";
const { ccclass } = _decorator;

@ccclass("EffectsManager")
export class EffectsManager extends Service {


    private _effectsQueue: Queue<EffectHandler> = new Queue<EffectHandler>();

    private _currentTime = 0;

    public get effectIsRunning() {
        return this._currentTime > 0;
    }

    PlayEffect(effectFunc: () => void, execTime: number): EffectsManager {

        if (this._currentTime <= 0) this._currentTime = 1;

        const handler = new EffectHandler();
        handler.effectFunc = effectFunc;
        handler.duration = execTime;
        handler.timeToStart = this._currentTime;

        this._effectsQueue.enqueue(handler);

        return this;
    }

    PlayEffectNow(effectFunc: () => void, execTime: number): EffectsManager {

        if (this._currentTime <= 0) this._currentTime = 1;

        setTimeout(() => effectFunc(), 0);
        const overalDur = this._effectsQueue.values.reduce((sum, current) => sum + current.duration, 0);;
        if (execTime > overalDur) this.PlayEffect(() => { }, execTime - overalDur);

        return this;
    }

    protected update(dt: number): void {
        if (this._currentTime > 0) {

            if (this._effectsQueue.length <= 0) {
                this._currentTime = 0;
                return;
            }

            const effect = this._effectsQueue.peek();

            if (effect.endTime < this._currentTime) {
                if (!effect.isPlayed) {
                    effect.timeToStart = this._currentTime;
                } else {
                    this._effectsQueue.dequeue();
                }
            }

            if (effect.timeToStart >= this._currentTime && !effect.isPlayed) {
                effect.isPlayed = true;
                setTimeout(() => effect.effectFunc(), 0);
            }

            this._currentTime += dt;
        }
    }
}

export class EffectHandler {
    public timeToStart: number;
    public duration: number;
    public isPlayed = false;
    public get endTime() {
        return this.timeToStart + this.duration;
    }

    public effectFunc: () => void;
}
