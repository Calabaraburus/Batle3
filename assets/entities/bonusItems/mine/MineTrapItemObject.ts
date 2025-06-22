import { instantiate, Prefab, UITransform, Vec3 } from 'cc';
import { ItemSubObject } from '../ItemSubObject';
import { GridCell } from '../../field/GridCell';
import { BattleController } from '../../battle/BattleController';
import { BaseItemVisual } from '../BaseItemVisual';
import { VisualEffectPlayer } from '../../battleEffects/VisualEffectPlayer';


export class MineTrapItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        this.initVisual();
    }

    protected onDestroy(): void {
        if (this.visualNode?.isValid) this.visualNode.destroy();
        this.visualNode = null;
    }

    /**
     * Мина срабатывает при попадании: поражает один случайный закрытый тайл врага.
     */
    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell || this.cell !== target) return false;

        // Наносим урон по своей клетке
        this.markCellAsHit(target);
        this.playExplosionEffect(target);

        // Поражаем случайный закрытый тайл противоположной стороны
        const enemyType = this.ownerType === 1 ? 2 : 1;
        const grid = BattleController.instance.gridManager;
        if (!grid) return false;

        const unopened = grid.getAllCells().filter(c =>
            c.getParameter('type') === enemyType &&
            c.getParameter('opened') !== true
        );

        if (unopened.length > 0) {
            const random = unopened[Math.floor(Math.random() * unopened.length)];
            this.markCellAsHit(random);
            this.playExplosionEffect(random);
        }

        this.consume();
        return true;
    }

    /** Вспомогательный метод: скрыть визуально предмет при установке */
    protected setVisualHidden(): void {
        this.visualNode?.getComponent(BaseItemVisual)?.setHide();
    }

    // воспроизводим анимацию взрыва
    protected playExplosionEffect(cell: GridCell): void {
        VisualEffectPlayer.instance.playExplosion(cell);
    }
}
