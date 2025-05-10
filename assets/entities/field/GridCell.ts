import { GridSubObject } from './GridSubObject';
import { Node } from 'cc';
import { UnitSubObject } from './UnitSubObject';
import { ItemSubObject } from './ItemSubObject';

/**
 * GridCell — логическая ячейка поля.
 * Хранит параметры, субобъекты (юниты, предметы и прочее) и визуальный узел.
 */
export class GridCell {
    // Словарь параметров ячейки (тип, координаты и др.)
    private parameters: Map<string, any> = new Map();

    // Список субобъектов, прикреплённых к ячейке (юнит, предмет, туман и т.д.)
    private subObjects: GridSubObject[] = [];

    // Список соседних ячеек
    public neighbors: GridCell[] = [];

    // Визуальный узел, соответствующий ячейке
    private visualNode: Node | null = null;

    // --- Работа с параметрами ---

    /**
     * Добавить параметр в ячейку.
     */
    addParameter(key: string, value: any): void {
        this.parameters.set(key, value);
    }

    /**
     * Получить параметр по ключу.
     */
    getParameter<T>(key: string): T | undefined {
        return this.parameters.get(key);
    }

    /**
     * Удалить параметр.
     */
    removeParameter(key: string): void {
        this.parameters.delete(key);
    }

    /**
     * Получить все параметры.
     */
    getParameters(): Map<string, any> {
        return this.parameters;
    }

    // --- Работа с субобъектами ---

    /**
     * Прикрепить субобъект к ячейке.
     */
    attachSubObject(obj: GridSubObject): void {
        this.subObjects.push(obj);
        obj.onAttach(this);
    }

    /**
     * Открепить субобъект от ячейки.
     */
    detachSubObject(obj: GridSubObject): void {
        const index = this.subObjects.indexOf(obj);
        if (index !== -1) {
            this.subObjects.splice(index, 1);
            obj.onDetach();
        }
    }

    /**
     * Получить все субобъекты ячейки.
     */
    getSubObjects(): GridSubObject[] {
        return this.subObjects;
    }

    // --- Работа с визуальной частью ---

    /**
     * Установить визуальный узел.
     */
    setVisualNode(node: Node): void {
        this.visualNode = node;
    }

    /**
     * Получить визуальный узел.
     */
    getVisualNode(): Node | null {
        return this.visualNode;
    }

    // --- Проверки на содержимое ---

    /**
     * Есть ли юнит в ячейке.
     */
    hasUnit(): boolean {
        return this.subObjects.some(obj => obj instanceof UnitSubObject);
    }

    /**
     * Есть ли предмет в ячейке.
     */
    hasItem(): boolean {
        return this.subObjects.some(obj => obj instanceof ItemSubObject);
    }

    /**
     * Есть ли в ячейке юнит или предмет.
     */
    hasAnyMainSubObject(): boolean {
        return this.hasUnit() || this.hasItem();
    }
}
