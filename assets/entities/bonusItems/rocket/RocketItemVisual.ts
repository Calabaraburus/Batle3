import { _decorator, Node } from 'cc';
import { BaseItemVisual } from '../BaseItemVisual';
const { ccclass } = _decorator;

@ccclass('RocketItemVisual')
export class RocketItemVisual extends BaseItemVisual {

    /** Углы поворота стрелки для pointy-top гекса (по часовой стрелке) */
    private static readonly angleByDirection: number[] = [0, -60, -120, 180, 120, 60];

    /** Установить визуальное направление ракеты (по индексу соседа) */
    public setDirection(index: number): void {
        const angle = RocketItemVisual.angleByDirection[index];

        // Поворачиваем визуал
        this.node.setRotationFromEuler(0, 0, angle);
    }

    /** При сокрытии предмета — убираем визуал */
    public override setHide(): void {
        super.setHide();
        // Здесь можно добавить эффекты исчезновения
    }

    /** При активации предмета — можно добавить визуальные эффекты */
    public override setActive(): void {
        super.setActive();
        // Например, вспышка, анимация и т.п.
    }
}
