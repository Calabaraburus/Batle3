import { instantiate, Prefab, Animation } from 'cc';
import { ItemSubObject } from '../ItemSubObject';
import { GridCell } from '../../field/GridCell';
import { ShieldEffectSubObject } from '../shieldEffect/ShieldEffectSubObject';
import { HexCell } from '../../field/HexCell';
import { BaseItemVisual } from '../BaseItemVisual';
import { VisualEffectPlayer } from '../../battleEffects/VisualEffectPlayer';
import { _decorator, Node} from 'cc';
import { ItemManager } from '../../battle/ItemManager';
import { RocketItemVisual } from './RocketItemVisual';
import { getNeighborInDirection } from '../../field/HexGridUtils';

/**
 * Бонус "Ракета": поражает цель + один соседний тайл.
 * Может использоваться только против противоположной стороны.
 */
export class RocketItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;
    public explosionPrefab: Prefab | null = null;
    private directionIndex = -1;

    /** Инициализация при добавлении на клетку */
    protected onInit(): void {
        this.initVisual();
    }

    protected onDestroy(): void {
        this.visualNode = null;
    }

    /** Активация предмета: выбираем направление */
    public setActive(): void {
        this.visualNode?.getComponent(BaseItemVisual)?.stopPulse();
        this.visualNode?.getComponent(BaseItemVisual)?.setSpriteFrame(1);

        if (!this.cell || this.cell.neighbors.length === 0) return;

        // Выбираем случайное направление из доступных соседей
        this.directionIndex = Math.floor(Math.random() * 6); // от 0 до 5 включительно

        console.log(`[Rocket] Направление: ${this.directionIndex}`);
        
        const visual = this.visualNode?.getComponent(RocketItemVisual);
        visual?.setDirection(this.directionIndex);
    }

    //  Переопределяем activate() в RocketItemObject
    public override activate(): void {
        this.setActive(); // твоя логика выбора направления и вращения

        // Визуально запускаем анимации, если нужно
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive();
    }

    /** Применяет эффект: поражает три клетки по направлению */
    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell || this.directionIndex === -1) return false;

        const isTargetEnemy = target.getParameter('type') === this.ownerType;
        const alreadyOpened = target.getParameter('opened') === true;

        if (!isTargetEnemy || alreadyOpened) return false;

        const second = getNeighborInDirection(target, this.directionIndex);
        const third = second ? getNeighborInDirection(second, this.directionIndex) : null;

        this.markCellAsHit(target);
        if (second) this.markCellAsHit(second);
        if (third) this.markCellAsHit(third);

        this.consume();
        return true;
    }

    /** Помечает клетку как поражённую, снимает туман, активирует визуал */
    protected markCellAsHit(cell: GridCell): void {
        const blocked = ShieldEffectSubObject.tryIntercept(cell);
        if (blocked) return;

        cell.addParameter('destroyed', true);

        cell.reveal(true); // ✅ всё остальное делает reveal

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
