import { instantiate, Prefab, UITransform, Vec3 } from 'cc';
import { GridCell } from '../../field/GridCell';
import { ItemSubObject } from '../ItemSubObject';
import { BaseItemVisual } from '../BaseItemVisual';
import { VisualEffectPlayer } from '../../battleEffects/VisualEffectPlayer';



export class BombItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    protected onInit(): void {
        this.isAutoTriggered = true; // 💣 теперь бомба считается автотриггерной
        this.initVisual();
    }

    protected onDestroy(): void {
        if (this.visualNode?.isValid) this.visualNode.destroy();
        this.visualNode = null;
    }

    /**
     * Взрывается при попадании по клетке: поражает свою клетку + случайного соседа.
     */
    public tryApplyEffectTo(target: GridCell): boolean {
        // 💣 Проверяем: если бомба в этой клетке — взрываемся
        if (!this.cell || this.cell !== target) return false;

        // Основной взрыв — по себе
        this.markCellAsHit(target);
        this.playExplosionEffect(target);

        // Доп. взрыв — по случайному соседу
        const neighbors = target.neighbors.filter(n => !n.getParameter('opened'));
        if (neighbors.length > 0) {
            const random = neighbors[Math.floor(Math.random() * neighbors.length)];
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
