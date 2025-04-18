import { _decorator } from "cc";
import { GameState } from "./GameState";
const { ccclass, property } = _decorator;

@ccclass("GameStateWritable")
export class GameStateWritable extends GameState {

    public set isPlayerTurn(value: boolean) {
        this._isPlayerTurn = value;
    }

    public get isPlayerTurn() {
        return super.isPlayerTurn;
    }
}
