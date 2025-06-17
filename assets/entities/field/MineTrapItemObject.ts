import { ItemSubObject } from './ItemSubObject';
import { instantiate, Prefab, UITransform, Vec3 } from 'cc';
import { GridCell } from './GridCell';
import { VisualEffectPlayer } from './VisualEffectPlayer';
import { BattleController } from './BattleController';
import { BaseItemVisual } from './BaseItemVisual';

export class MineTrapItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        this.visualNode = instantiate(this.prefab);
        this.visualNode.name = 'ItemVisual';
        tileNode.addChild(this.visualNode);

        this.scaleToCell(0.65, 0.75);
        this.visualNode.setPosition(new Vec3(0, 0, 0));

        this.setVisualHidden();  // По умолчанию скрыт

        this.ownerType = this.cell.getParameter<number>('type') ?? -1;
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
