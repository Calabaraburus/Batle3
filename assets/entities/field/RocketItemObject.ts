import { ItemSubObject } from './ItemSubObject';
import { GridCell } from './GridCell';
import { instantiate, Prefab } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
import { HexCell } from './HexCell';

/**
 * Бонус "Ракета": поражает цель + один соседний тайл.
 * Может использоваться только против противоположной стороны.
 */
export class RocketItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    /** Инициализация при добавлении на клетку */
    protected onInit(): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        // Создаём визуальный узел
        this.visualNode = instantiate(this.prefab);
        this.visualNode.name = 'ItemVisual';
        tileNode.addChild(this.visualNode);

        this.scaleToCell();       // Подгонка под тайл
        this.setVisualHidden();  // По умолчанию скрыт

        // Запоминаем сторону-владельца (противоположная будет активировать)
        this.ownerType = this.cell.getParameter<number>('type') || -1;
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
        cell.addParameter('destroyed', true);
        cell.addParameter('opened', true);

        // Удалить все компоненты тумана
        const fogs = cell.getSubObjects().filter(s => s.constructor.name === 'FogSubObject');
        for (const fog of fogs) {
            cell.detachSubObject(fog);
        }

        // Обновить визуал
        const hex = cell.getVisualNode()?.getComponent(HexCell);
        hex?.markAsOpened(true);     // скрывает туман, помечает как открытую
        hex?.markAsBurning();        // добавляет огонь
    }

    /** Вспомогательный метод: скрыть визуально предмет при установке */
    protected setVisualHidden(): void {
        this.visualNode?.getComponent(BaseItemVisual)?.setHide();
    }
}
