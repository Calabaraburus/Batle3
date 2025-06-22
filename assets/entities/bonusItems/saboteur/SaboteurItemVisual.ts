import { _decorator, Component, tween, Vec3, UIOpacity } from 'cc';
import { GridCell } from '../../field/GridCell';
import { BaseItemVisual } from '../BaseItemVisual';

const { ccclass } = _decorator;

@ccclass('SaboteurItemVisual')
export class SaboteurItemVisual extends BaseItemVisual {

    // public override setHide(): void {
    //     this.node.active = false;
    //     const opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
    //     opacity.opacity = 0;
    // }

    // public override setActive(): void {
    //     this.node.active = true;
    //     const opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
    //     opacity.opacity = 255;
    // }

    /** Анимация кражи предмета: перелёт от врага к диверсанту */
    public playStealAnimation(fromCell: GridCell, toCell: GridCell): void {
        const node = this.node;
        if (!node || !node.isValid) return;

        // Получаем мировые позиции
        const fromWorld = fromCell.getVisualNode()?.getWorldPosition();
        const toWorld = toCell.getVisualNode()?.getWorldPosition();
        if (!fromWorld || !toWorld) return;

        // Подготовка: позиция и прозрачность
        const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacity.opacity = 255;

        node.setWorldPosition(fromWorld);
        node.setScale(new Vec3(0.8, 0.8, 1));

        // Делаем визуал видимым
        node.active = true;

        // Перелёт
        tween(node)
            .to(0.5, { worldPosition: toWorld }, { easing: 'quadInOut' })
            .call(() => {
                // Scale pop на месте назначения
                tween(node)
                    .to(0.15, { scale: new Vec3(1.1, 1.1, 1) })
                    .to(0.15, { scale: new Vec3(0.8, 0.8, 1) })
                    .start();
            })
            .start();
    }
}
