import { _decorator, Component, Prefab } from 'cc';
import { HexGridManager } from './HexGridManager';
import { FranceUnitObject } from './FranceUnitObject';
import { BombItemObject } from './BombItemObject';
import { RocketItemObject } from './RocketItemObject';
import { FogSubObject } from './FogSubObject';
import { PlacementPlanner } from './PlacementPlanner';
import { UnitGroupManager } from './UnitGroupManager';
import { GridCell } from './GridCell';
import { UnitSubObject } from './UnitSubObject';
import { ItemSubObject } from './ItemSubObject';
import { SpawnConfig } from './SpawnConfig';

const { ccclass, property } = _decorator;

@ccclass('SubObjectGenerator')
export class SubObjectGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: Prefab })
    francePrefab: Prefab | null = null;

    @property({ type: Prefab })
    fogPrefab: Prefab | null = null;

    @property({ type: [Number] })
    playerUnitGroupSizes: number[] = [];

    @property({ type: [Number] })
    enemyUnitGroupSizes: number[] = [];

    // 🟩 Предметы как конфиги
    @property({ type: SpawnConfig })
    playerBombConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemyBombConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    playerRocketConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemyRocketConfig: SpawnConfig = new SpawnConfig();

    start() {
        if (!this.gridManager) return;

        const playerCells = this.gridManager.getPlayerCells();
        const enemyCells = this.gridManager.getEnemyCells();

        const playerPlan = PlacementPlanner.planGroups(playerCells, this.playerUnitGroupSizes, 'player');
        const enemyPlan = PlacementPlanner.planGroups(enemyCells, this.enemyUnitGroupSizes, 'enemy');

        this.instantiateUnits(playerPlan, this.francePrefab, FranceUnitObject);
        this.instantiateUnits(enemyPlan, this.francePrefab, FranceUnitObject);

        this.spawnItem(playerCells, this.playerBombConfig, BombItemObject);
        this.spawnItem(playerCells, this.playerRocketConfig, RocketItemObject);

        this.spawnItem(enemyCells, this.enemyBombConfig, BombItemObject);
        this.spawnItem(enemyCells, this.enemyRocketConfig, RocketItemObject);

        this.spawnFog(enemyCells, this.fogPrefab);
    }

    private spawnItem<T extends ItemSubObject & { prefab: Prefab | null }>(
        cells: GridCell[],
        config: SpawnConfig,
        ItemType: new () => T
    ): void {
        if (!config.prefab) return;

        const available = [...cells].filter(cell =>
            !cell.hasAnyMainSubObject() // исключаем ячейки с юнитами и предметами
        );

        if (available.length < config.count) {
            console.warn(`[SpawnItem] Недостаточно свободных ячеек для ${ItemType.name}: нужно ${config.count}, доступно ${available.length}`);
        }

        for (let i = 0; i < config.count && available.length > 0; i++) {
            const index = Math.floor(Math.random() * available.length);
            const cell = available.splice(index, 1)[0];

            const item = new ItemType();
            item.prefab = config.prefab;
            cell.attachSubObject(item);
        }
    }

    private instantiateUnits<T extends UnitSubObject & { prefab: Prefab | null }>(
        plans: { cells: GridCell[], groupId: string }[],
        prefab: Prefab | null,
        UnitType: new () => T
    ): void {
        if (!prefab) return;

        for (const plan of plans) {
            UnitGroupManager.instance.createGroup(plan.groupId);
            for (const cell of plan.cells) {
                const unit = new UnitType();
                unit.prefab = prefab;
                unit.groupId = plan.groupId;
                cell.attachSubObject(unit);
                UnitGroupManager.instance.registerUnitToGroup(plan.groupId, unit, cell);
            }
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
