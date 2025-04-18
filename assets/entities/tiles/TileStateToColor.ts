import {
    _decorator,
    Sprite,
    Enum,
    Color
} from 'cc';
import { TileState } from './TileState';

const { ccclass, property } = _decorator;

@ccclass('TileTypeToColor')
export class TileStateToColor {
    @property({ type: Enum(TileState) })
    state: TileState = TileState.empty;

    @property(Color)
    color: Color;
}
