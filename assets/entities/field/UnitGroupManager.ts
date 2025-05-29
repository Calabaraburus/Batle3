// В UnitGroupManager.ts — заменим метод triggerGroupDestructionEffect на расширенную версию

import { GridCell } from './GridCell';
import { HexCell } from './HexCell';
import { UnitSubObject } from './UnitSubObject';

export interface UnitGroupData {
    id: string;
    units: UnitSubObject[];
    cells: GridCell[];
    isDestroyed: boolean;
}

export class UnitGroupManager {
    private static _instance: UnitGroupManager;
    public static get instance(): UnitGroupManager {
        if (!this._instance) this._instance = new UnitGroupManager();
        return this._instance;
    }

    private groups: Map<string, UnitGroupData> = new Map();

    public createGroup(id: string): void {
        if (!this.groups.has(id)) {
            this.groups.set(id, {
                id,
                units: [],
                cells: [],
                isDestroyed: false,
            });
        }
    }

    public registerUnitToGroup(id: string, unit: UnitSubObject, cell: GridCell): void {
        const group = this.groups.get(id);
        if (!group) return;

        // 🔒 Предотвращаем повторную регистрацию
        if (group.units.includes(unit) || group.cells.includes(cell)) return;

        unit.groupId = id;
        cell.addParameter('groupId', id);

        group.units.push(unit);
        group.cells.push(cell);
    }

    public onUnitDestroyed(unit: UnitSubObject): void {
        const id = unit.groupId;
        const group = this.groups.get(id);
        if (!group || group.isDestroyed) return;

        const allDead = group.units.every(u => !u.isAlive);
        if (allDead) {
            group.isDestroyed = true;
            this.triggerGroupDestructionEffect(group);
        }
    }

    private triggerGroupDestructionEffect(group: UnitGroupData): void {
        console.log(`[GroupEffect] Triggered for group ${group.id}`);
        const affected = new Set<GridCell>();

        for (const cell of group.cells) {
            const neighbors = cell.getVisualNode()?.getComponent(HexCell)?.neighbors || [];

            for (const n of neighbors) {
                const nCell = n.getLogicalCell();
                if (nCell && !group.cells.includes(nCell)) {
                    affected.add(nCell);
                }
            }
        }

        for (const neighbor of affected) {
            const sameOwner = neighbor.getParameter('type') === group.cells[0].getParameter('type');
            if (sameOwner) {
                neighbor.addParameter('destroyed', true);

                // Удаление тумана войны
                const fogs = neighbor.getSubObjects().filter(sub => sub.constructor.name === 'FogSubObject');
                for (const fog of fogs) {
                    neighbor.detachSubObject(fog);
                }

                // Открытие тайла без повторной проверки группы
                const visual = neighbor.getVisualNode();
                const hex = visual?.getComponent(HexCell);
                hex?.markAsOpened(true); // передаём suppressGroupCheck = true
            }
        }
    }

    public getGroup(id: string): UnitGroupData | undefined {
        return this.groups.get(id);
    }

    public getGroupOf(unit: UnitSubObject): UnitGroupData | undefined {
        return this.groups.get(unit.groupId);
    }

    public clearAll(): void {
        this.groups.clear();
    }
}
