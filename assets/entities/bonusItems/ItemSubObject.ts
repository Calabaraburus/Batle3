import { instantiate, UITransform, Vec3, type Node, type Prefab } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
import { GridSubObject } from '../subObjects/GridSubObject';
import { GridCell } from '../field/GridCell';
import { VisualEffectPlayer } from '../battleEffects/VisualEffectPlayer';
import { HexCell } from '../field/HexCell';


export abstract class ItemSubObject extends GridSubObject {

    public stealable = true; // возможность красть предметы

    public visualNode: Node | null = null;
    public prefab: Prefab | null = null;

    public isAutoTriggered = false; // ❗ По умолчанию нет

    protected isUsed = false;
    protected isArmed = false;
    protected ownerType = -1; // 1 = игрок, 2 = враг
    public visualScale: Vec3 = new Vec3(1, 1, 1); // сохраняем масштаб

    /** Предмет визуально скрыт (неактивен) */
    public activate(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive();
    }

    /** Предмет уничтожен (или обезврежен) */
    public deactivate(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive(); // можно заменить на .setInactive() при наличии
        this.isUsed = true;
    }

    // сокрытие визуала
    public override setHidden(hidden: boolean): void {
        if (this.visualNode?.isValid) {
            this.visualNode.active = !hidden;
        }
    }

    public attachToCell(cell: GridCell): void {
        cell.attachSubObject(this);
    }

    /**
     * Вызывается при привязке объекта к клетке
     * Можно переопределить в потомке для кастомной логики
     */
    public onAttachToCell(cell: GridCell): void {
        this.cell = cell;
    }

    protected initVisual(scaleCoef = 0.7): void {
        if (!this.cell || !this.prefab) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        if (!this.visualNode) {
            this.visualNode = instantiate(this.prefab);
            this.visualNode.name = 'ItemVisual';
            tileNode.addChild(this.visualNode);
            this.scaleToCell(scaleCoef, scaleCoef);
        }

        const wasStolen = this.cell.getParameter('wasStolen') === true;
        if (wasStolen) {
            this.setVisualActive();
            this.cell.removeParameter('wasStolen');
        } else {
            this.setVisualHidden();
        }

        this.ownerType = this.cell.getParameter<number>('type') || -1;
    }

    public isReadyToArm(): boolean {
        return this.isArmed;
    }

    public isReadyToUse(): boolean {
        return this.isUsed;
    }

    public isSelectable(): boolean {
        return !this.isUsed && this.isArmed;
    }

    public setOwner(newType: number): void {
        this.ownerType = newType;
    }

    protected setVisualActive(): void {
        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive();
    }

        /** Вспомогательный метод: скрыть визуально предмет при установке */
    protected setVisualHidden(): void {
        this.visualNode?.getComponent(BaseItemVisual)?.setHide();
    }

    // воспроизводим анимацию взрыва
    protected playExplosionEffect(cell: GridCell): void {
        VisualEffectPlayer.instance.playExplosion(cell);
    }

    /** Сбрасывает предмет в неактивное состояние (если активация невозможна) */
    public resetState(): void {
        this.isArmed = false;

        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setActive();

        // Сброс масштаба к сохранённому значению
        if (this.visualNode?.isValid) {
            this.visualNode.setScale(this.visualScale);
        }
    }

    /** Проверка: может ли игрок активировать этот предмет (своим нажатием) */
    public canBeActivatedBy(cell: GridCell, playerType: number): boolean {
        const isEnemyItem = this.ownerType !== playerType;
        const isRevealed = cell.getParameter('opened') === true;

        return isEnemyItem && isRevealed && !this.isUsed && !this.isArmed;
    }

    /** Подгонка визуала под масштаб ячейки */
    protected scaleToCell(coefWidth: number, coefHeight: number): void {
        if (!this.cell || !this.visualNode) return;

        const tileNode = this.cell.getVisualNode();
        if (!tileNode) return;

        const tileTransform = tileNode.getComponent(UITransform);
        const itemTransform = this.visualNode.getComponent(UITransform);
        if (!tileTransform || !itemTransform) return;

        const scaleX = tileTransform.contentSize.width / itemTransform.contentSize.width * coefWidth;
        const scaleY = tileTransform.contentSize.height / itemTransform.contentSize.height * coefHeight;
        const uniformScale = Math.min(scaleX, scaleY);

        this.visualScale = new Vec3(uniformScale, uniformScale, 1); // 💾 сохранить масштаб
        this.visualNode.setScale(this.visualScale);
    }

    /** Переводит предмет в "готов к применению" */
    public arm(): void {
        if (this.isArmed || this.isUsed) return;

        this.isArmed = true;

        const visual = this.visualNode?.getComponent(BaseItemVisual);
        visual?.setArmed();
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
            this.cell.detachSubObject(this);
        }

        this.isUsed = true;
    }

    /** Вспомогательный метод для удаления тумана с клетки */
    protected revealFog(cell: GridCell): void {
        const fogs = cell.getSubObjects().filter(s => s.constructor.name === 'FogSubObject');
        for (const fog of fogs) cell.detachSubObject(fog);
    }

    /** Помечает клетку как поражённую и открывает её */
    protected markCellAsHit(cell: GridCell): void {
        cell.addParameter('destroyed', true);
        cell.addParameter('opened', true);

        this.revealFog(cell);

        // const visual = cell.getVisualNode();
        const hex = cell.getVisualNode()?.getComponent(HexCell);

        hex?.markAsOpened(true);
        hex?.markAsBurning();
    }

    public abstract tryApplyEffectTo(target: GridCell): boolean;

    protected abstract onInit(): void;
    protected abstract onDestroy(): void;
}
