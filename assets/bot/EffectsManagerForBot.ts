import { EffectsManager } from "../entities/game/EffectsManager";


export class EffectsManagerForBot extends EffectsManager {
    PlayEffect(effectFunc: () => void, execTime: number): EffectsManager { return this; };

    PlayEffectNow(effectFunc: () => void, execTime: number): EffectsManager { return this; };
}
