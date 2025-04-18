import { BehaviourSelector } from "../behaviours/BehaviourSelector";
import { EffectsManager } from "./EffectsManager";
import { GameManager } from "./GameManager";

/**  
 * Waits for all game activities to end turn, such as animation etc. 
 */
export class EOTInvoker {
    private _gameManager: GameManager;

    private _isStarted: boolean;
    private _effectsManager: EffectsManager;

    constructor(gameManager: GameManager,
        effectsManager: EffectsManager) {
        this._gameManager = gameManager;
        this._effectsManager = effectsManager;
        this._isStarted = false;
    }

    public endTurn() {
        this._isStarted = true;
    }

    public stop() {
        this._isStarted = false;
    }

    public update() {
        if (this._isStarted) {
            if (!this._effectsManager.effectIsRunning) {
                this._isStarted = false;
                this._gameManager.changeGameState("endTurnEvent");
            }
        }
    }
}
