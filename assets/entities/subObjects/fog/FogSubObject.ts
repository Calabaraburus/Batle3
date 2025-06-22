import { instantiate, Node, Prefab } from 'cc';
import { GridSubObject } from '../GridSubObject';
import { GridCell } from '../../field/GridCell';

export class FogSubObject extends GridSubObject {
    public fogPrefab: Prefab | null = null;
    private fogNode: Node | null = null;

    onInit(): void {
        // опциональная инициализация
    }

    onAttach(cell: GridCell): void {
        this.cell = cell;
        cell.addParameter('visibility', false);

        if (this.fogPrefab) {
            this.fogNode = instantiate(this.fogPrefab);
            if (this.fogNode) {
                this.fogNode.name = 'FogEffect'; // уникальное имя
                const visual = cell.getVisualNode();
                if (visual) {
                    visual.addChild(this.fogNode);
                }
            }
        }
    }

    onDetach(): void {
        if (this.cell) {
            this.cell.addParameter('visibility', true);
        }

        // Вместо удаления — отключаем узел
        if (this.fogNode && this.fogNode.isValid) {
            this.fogNode.active = false;
        }

        // Не обнуляем, чтобы сохранить ноду для возможного повторного включения
        // this.fogNode = null;
        this.cell = null;
    }

    onDestroy(): void {
        this.onDetach(); // деактивация при удалении
    }
}
