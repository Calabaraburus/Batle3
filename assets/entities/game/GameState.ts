import { _decorator } from "cc";
import { Service } from "../services/Service";
const { ccclass, property } = _decorator;

export class GameState extends Service {
    protected _isPlayerTurn: boolean;

    public get isPlayerTurn(): boolean {
        return this._isPlayerTurn;
    }
}


