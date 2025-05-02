import { _decorator } from 'cc';
import { TileObject } from './TileObject';
const { ccclass, property } = _decorator;

@ccclass('UnitObject')
export abstract class UnitObject extends TileObject {
    @property attack = 1;
    @property hp = 1;

    moveTo(x: number, y: number): void {
        // логика перемещения
    }
}
