import { _decorator } from 'cc';
import { UnitObject } from '../UnitObject';
const { ccclass } = _decorator;

@ccclass('BomberObject')
export class BomberObject extends UnitObject {
    onActivate(): void {
        console.log('Бомбер активирован — взрывается!');
        // Здесь логика урона по соседним тайлам
    }

    detonate(): void {
        // Реализация взрыва
    }
}
