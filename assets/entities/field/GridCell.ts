import { GridSubObject } from './GridSubObject';
import { Node } from 'cc';

export class GridCell {
    private parameters: Map<string, any> = new Map();
    private subObjects: GridSubObject[] = [];
    public neighbors: GridCell[] = [];

    private visualNode: Node | null = null;

    // --- Параметры ---

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

    // --- Субъекты ---

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

    // --- Визуальная связь с нодой ---

    setVisualNode(node: Node): void {
        this.visualNode = node;
    }

    getVisualNode(): Node | null {
        return this.visualNode;
    }
}
