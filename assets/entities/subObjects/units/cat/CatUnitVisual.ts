import { _decorator } from 'cc';
import { BaseUnitVisual } from '../BaseUnitVisual';
const { ccclass } = _decorator;

@ccclass('CatUnitVisual')
export class CatUnitVisual extends BaseUnitVisual {
    // Можно переопределить методы или добавить свои
    public setDead(): void {
        super.setDead();
        // например: проиграть анимацию, звук и т.д.
    }
}
