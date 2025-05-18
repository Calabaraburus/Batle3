import { _decorator, Component, Prefab } from 'cc';
import { HexGridManager } from './HexGridManager';
import { FranceUnitObject } from './FranceUnitObject';
import { BombItemObject } from './BombItemObject';
import { FogSubObject } from './FogSubObject';
import type { GridCell } from './GridCell';
import { UnitSubObject } from './UnitSubObject';
import { ItemSubObject } from './ItemSubObject';
import { PlacementPlanner } from './PlacementPlanner';
import { UnitGroupManager } from './UnitGroupManager'; // 👈 добавляем импорт

const { ccclass, property } = _decorator;

@ccclass('SubObjectGenerator')
export class SubObjectGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: Prefab })
    francePrefab: Prefab | null = null;

    @property({ type: Prefab })
    bombPrefab: Prefab | null = null;

    @property({ type: Prefab })
    fogPrefab: Prefab | null = null;

    @property({ type: [Number] })
    playerUnitGroupSizes: number[] = [];

    @property({ type: [Number] })
    enemyUnitGroupSizes: number[] = [];

    @property playerItems = 1;
    @property enemyItems = 1;

    start() {
        if (!this.gridManager) return;

        const playerCells = this.gridManager.getPlayerCells();
        const enemyCells = this.gridManager.getEnemyCells();

        const playerPlan = PlacementPlanner.planGroups(playerCells, this.playerUnitGroupSizes, 'player');
        const enemyPlan = PlacementPlanner.planGroups(enemyCells, this.enemyUnitGroupSizes, 'enemy');

        this.instantiateUnits(playerPlan, this.francePrefab, FranceUnitObject);
        this.instantiateUnits(enemyPlan, this.francePrefab, FranceUnitObject);

        this.spawnCustomItems(playerCells, this.playerItems, this.bombPrefab, BombItemObject);
        this.spawnCustomItems(enemyCells, this.enemyItems, this.bombPrefab, BombItemObject);

        this.spawnFog(enemyCells, this.fogPrefab);
    }

    private instantiateUnits<T extends UnitSubObject & { prefab: Prefab | null }>(
        plans: { cells: GridCell[], groupId: string }[],
        prefab: Prefab | null,
        UnitType: new () => T
    ): void {
        if (!prefab) return;

        for (const plan of plans) {
            // 1. Создаем группу по ID
            UnitGroupManager.instance.createGroup(plan.groupId);

            for (const cell of plan.cells) {
                const unit = new UnitType();
                unit.prefab = prefab;
                unit.groupId = plan.groupId;

                // 2. Прикрепляем юнита к клетке (вызовет unit.onAttach → onInit)
                cell.attachSubObject(unit);

                // 3. Явно регистрируем в менеджере групп
                UnitGroupManager.instance.registerUnitToGroup(plan.groupId, unit, cell);
            }
        }
    }


    private spawnCustomItems<T extends ItemSubObject & { prefab: Prefab | null }>(
        cells: GridCell[],
        count: number,
        prefab: Prefab | null,
        ItemType: new () => T
    ): void {
        if (!prefab) return;

        const available = [...cells].filter(cell => !cell.hasAnyMainSubObject());

        for (let i = 0; i < count && available.length > 0; i++) {
            const index = Math.floor(Math.random() * available.length);
            const cell = available.splice(index, 1)[0];

            const item = new ItemType();
            item.prefab = prefab;
            cell.attachSubObject(item);
        }
    }

    private spawnFog(cells: GridCell[], prefab: Prefab | null): void {
        if (!prefab) return;

        for (const cell of cells) {
            const fog = new FogSubObject();
            fog.fogPrefab = prefab;
            cell.attachSubObject(fog);
        }
    }
}
