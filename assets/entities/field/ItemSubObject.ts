import { GridSubObject } from './GridSubObject';
import { UITransform, Vec3, type Node, type Prefab } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
import { GridCell } from './GridCell';

export abstract class ItemSubObject extends GridSubObject {
    public visualNode: Node | null = null;
    public prefab: Prefab | null = null;

    protected isUsed = false;
    protected isArmed = false;
    protected ownerType = -1; // 1 = игрок, 2 = враг

    /** Предмет визуально скрыт (неактивен) */
    public activate(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive(); // показать обычное состояние
    }

    /** Предмет уничтожен (или обезврежен) */
    public deactivate(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive(); // можно заменить на .setInactive() при наличии
        this.isUsed = true;
    }

    public isReadyToArm(): boolean {
        return this.isArmed;
    }

    public isReadyToUse(): boolean {
        return this.isUsed;
    }

    /** Проверка: может ли игрок активировать этот предмет (своим нажатием) */
    public canBeActivatedBy(cell: GridCell, playerType: number): boolean {
        const isEnemyItem = this.ownerType !== playerType;
        const isRevealed = cell.getParameter('opened') === true;

        return isEnemyItem && isRevealed && !this.isUsed && !this.isArmed;
    }

    /** Подгонка визуала под масштаб ячейки */
    protected scaleToCell(): void {
        if (!this.cell || !this.visualNode) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        const tileTransform = tileNode.getComponent(UITransform);
        const itemTransform = this.visualNode.getComponent(UITransform);
        if (!tileTransform || !itemTransform) return;

        const scaleX = tileTransform.contentSize.width / itemTransform.contentSize.width * 0.7;
        const scaleY = tileTransform.contentSize.height / itemTransform.contentSize.height * 0.7;
        const uniformScale = Math.min(scaleX, scaleY);

        this.visualNode.setScale(new Vec3(uniformScale, uniformScale, 1));
    }

    /** Переводит предмет в "готов к применению" */
    public arm(): void {
        if (this.isArmed || this.isUsed) return;

        this.isArmed = true;

        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setArmed(); // включает пульсацию
    }

    /** Удаляет предмет с поля: и логически, и визуально */
    public consume(): void {
        if (this.isUsed) return;

        // Удаляем визуал
        if (this.visualNode?.isValid) {
            this.visualNode.destroy();
            this.visualNode = null;
        }

        // Удаляем из логики
        if (this.cell) {
            this.cell.detachSubObject(this); // теперь cell ещё не null
        }

        this.isUsed = true;
    }

    /** Логика применения эффекта (реализуется в наследнике) */
    public abstract tryApplyEffectTo(target: GridCell): boolean;

    protected abstract onInit(): void;
    protected abstract onDestroy(): void;
}
