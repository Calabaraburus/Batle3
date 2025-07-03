import { GridCell } from '../field/GridCell';
import { HexCell } from '../field/HexCell';
import { ScoreManager } from '../pointsSystem/ScoreManager';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';
import { BattleController } from './BattleController';

export interface UnitGroupData {
    id: string;
    units: UnitSubObject[];
    cells: GridCell[];
    isDestroyed: boolean;
    ownerType: 'player' | 'enemy'; // ⬅️ Добавлено поле для различия сторон
}

export class UnitGroupManager {
    private static _instance: UnitGroupManager;
    public static get instance(): UnitGroupManager {
        if (!this._instance) this._instance = new UnitGroupManager();
        return this._instance;
    }

    private groups: Map<string, UnitGroupData> = new Map();

    /**
     * Создаёт новую группу с владельцем.
     */
    public createGroup(id: string, ownerType: 'player' | 'enemy'): void {
        if (!this.groups.has(id)) {
            this.groups.set(id, {
                id,
                units: [],
                cells: [],
                isDestroyed: false,
                ownerType,
            });
        }
    }

    /**
     * Привязывает юнита к группе.
     */
    public registerUnitToGroup(id: string, unit: UnitSubObject, cell: GridCell): void {
        const group = this.groups.get(id);
        if (!group) return;

        if (group.units.includes(unit) || group.cells.includes(cell)) return;

        unit.groupId = id;
        cell.addParameter('groupId', id);

        group.units.push(unit);
        group.cells.push(cell);
    }

    /**
     * Обработка смерти юнита — проверка на уничтожение всей группы.
     */
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

    /**
     * Побочный эффект при уничтожении группы — открытие соседних клеток и начисление очков.
     */
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

                const fogs = neighbor.getSubObjects().filter(sub => sub.constructor.name === 'FogSubObject');
                for (const fog of fogs) {
                    neighbor.detachSubObject(fog);
                }

                BattleController.instance.openAndRevealCell(neighbor);
            }
        }

        ScoreManager.instance.registerGroupDestroyed(group.units.length);
    }

    /**
     * Возвращает одну группу по ID.
     */
    public getGroup(id: string): UnitGroupData | undefined {
        return this.groups.get(id);
    }

    /**
     * Возвращает группу, к которой принадлежит юнит.
     */
    public getGroupOf(unit: UnitSubObject): UnitGroupData | undefined {
        return this.groups.get(unit.groupId);
    }

    /**
     * Очищает все группы.
     */
    public clearAll(): void {
        this.groups.clear();
    }

    /**
     * Возвращает все группы игрока.
     */
    public getAllPlayerGroups(): UnitGroupData[] {
        return Array.from(this.groups.values()).filter(group => group.ownerType === 'player');
    }

    /**
     * Возвращает все группы врага.
     */
    public getAllEnemyGroups(): UnitGroupData[] {
        return Array.from(this.groups.values()).filter(group => group.ownerType === 'enemy');
    }

    /**
     * Возвращает всех юнитов на поле.
     */
    public getAllUnits(): UnitSubObject[] {
        return Array.from(this.groups.values()).flatMap(group => group.units);
    }
}
