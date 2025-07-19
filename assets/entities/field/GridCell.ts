import { ItemSubObject } from "../bonusItems/ItemSubObject";
import { GridSubObject } from "../subObjects/GridSubObject";
import { UnitSubObject } from "../subObjects/units/UnitSubObject";
import { _decorator, Node } from 'cc';
import { HexCell } from "./HexCell";
import { ItemManager } from "../battle/ItemManager";
import { EffectSubObject } from "../subObjects/EffectSubObject";

/**
 * GridCell — логическая ячейка поля.
 * Хранит параметры, субобъекты (юниты, предметы и прочее) и визуальный узел.
 */
export class GridCell {

    // координаты в сетке
    public x = 0;
    public y = 0;

    // Словарь параметров ячейки (тип, координаты и др.)
    private parameters: Map<string, any> = new Map();

    // Список субобъектов, прикреплённых к ячейке (юнит, предмет, туман и т.д.)
    private subObjects: GridSubObject[] = [];

    // Список соседних ячеек
    public neighbors: GridCell[] = [];

    // Визуальный узел, соответствующий ячейке
    private visualNode: Node | null = null;

    // --- Работа с параметрами ---

    addParameter(key: string, value: any): void {
        this.parameters.set(key, value);
    }

    getParameter<T>(key: string): T | undefined {
        return this.parameters.get(key);
    }

    removeParameter(key: string): void {
        this.parameters.delete(key);
    }

    getParameters(): Map<string, any> {
        return this.parameters;
    }

    getGroupId(): string | undefined {
        return this.getParameter<string>('groupId');
    }

    isBlockedForGroups(): boolean {
        return this.getParameter<boolean>('blockedForGroups') === true;
    }

    setBlockedForGroups(value: boolean): void {
        this.addParameter('blockedForGroups', value);
    }

    // --- Работа с субобъектами ---

    attachSubObject(obj: GridSubObject): void {
        this.subObjects.push(obj);
        obj.onAttach(this);
    }

    detachSubObject(obj: GridSubObject): void {
        const index = this.subObjects.indexOf(obj);
        if (index !== -1) {
            this.subObjects.splice(index, 1);
            obj.onDetach();
        }
    }

    getSubObjects(): GridSubObject[] {
        return this.subObjects;
    }

    public reveal(forceKill = false): void {
        this.addParameter('opened', true);

        const hex = this.getVisualNode()?.getComponent(HexCell);
        hex?.markAsOpened(forceKill); // вызывает .markAsBurning и т.п.

        // ⛅ Удаляем туман
        const fogs = this.getSubObjects().filter(obj => obj.constructor.name === 'FogSubObject');
        for (const fog of fogs) {
            this.detachSubObject(fog);
        }

        // 🔄 Показываем визуалы
        for (const sub of this.getSubObjects()) {
            if (typeof sub.setHidden === 'function') {
                sub.setHidden(false);
            }
        }

        // 💣 Автоактивация (например, бомбы)
        ItemManager.instance.tryAutoTriggerItemsOnCell(this);
    }

    // --- Работа с визуальной частью ---

    setVisualNode(node: Node): void {
        this.visualNode = node;
    }

    getVisualNode(): Node | null {
        return this.visualNode;
    }

    // --- Проверки на содержимое ---

    hasUnit(): boolean {
        return this.subObjects.some(obj => obj instanceof UnitSubObject);
    }

    hasItem(): boolean {
        return this.subObjects.some(obj => obj instanceof ItemSubObject);
    }

    hasEffect(): boolean {
        return this.subObjects.some(obj => obj instanceof EffectSubObject);
    }

    hasAnyMainSubObject(): boolean {
        return this.hasUnit() || this.hasItem();
    }
} 
