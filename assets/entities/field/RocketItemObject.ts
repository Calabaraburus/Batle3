import { ItemSubObject } from './ItemSubObject';
import { GridCell } from './GridCell';
import { instantiate, Prefab, Animation } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
import { HexCell } from './HexCell';
import { ShieldEffectSubObject } from './ShieldEffectSubObject';
import { VisualEffectPlayer } from './VisualEffectPlayer';

/**
 * Бонус "Ракета": поражает цель + один соседний тайл.
 * Может использоваться только против противоположной стороны.
 */
export class RocketItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;
    public explosionPrefab: Prefab | null = null;

    /** Инициализация при добавлении на клетку */
    protected onInit(): void {
        this.initVisual();
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }

    /** Применяет эффект — удар по вражеской клетке и случайному соседу */
    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell) return false;

        const isTargetEnemy = target.getParameter('type') === this.ownerType;
        const alreadyOpened = target.getParameter('opened') === true;

        // Можно применять только к закрытым тайлам противника
        if (!isTargetEnemy || alreadyOpened) return false;

        // 1. Основной удар
        this.markCellAsHit(target);

        // 2. Дополнительный случайный сосед
        const neighbors = target.neighbors.filter(n => n.getParameter('opened') !== true);
        if (neighbors.length > 0) {
            const random = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.markCellAsHit(random);
        }

        // 3. Удалить бонус
        this.consume();
        return true;
    }

    /** Помечает клетку как поражённую, снимает туман, активирует визуал */
    protected markCellAsHit(cell: GridCell): void {
        const blocked = ShieldEffectSubObject.tryIntercept(cell); // 👈 вызов
        if (blocked) return;

        // 💥 Разрушаем клетку
        cell.addParameter('destroyed', true);
        cell.addParameter('opened', true);

        const fogs = cell.getSubObjects().filter(s => s.constructor.name === 'FogSubObject');
        for (const fog of fogs) {
            cell.detachSubObject(fog);
        }

        const hex = cell.getVisualNode()?.getComponent(HexCell);
        hex?.markAsOpened(true);
        hex?.markAsBurning();
        this.playExplosionEffect(cell);
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
