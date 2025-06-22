import { _decorator, Component, Prefab, instantiate } from 'cc';
import { BombItemObject } from '../bonusItems/bomb/BombItemObject';
import { SpawnConfig } from './SpawnConfig';
import { EffectSubObject } from './EffectSubObject';
import { SaboteurItemObject } from '../bonusItems/saboteur/SaboteurItemObject';
import { HexGridManager } from '../field/HexGridManager';
import { PlacementPlanner } from './PlacementPlanner';
import { FranceUnitObject } from './units/FranceUnitObject';
import { MineTrapItemObject } from '../bonusItems/mine/MineTrapItemObject';
import { ShieldItemObject } from '../bonusItems/shield/ShieldItemObject';
import { RocketItemObject } from '../bonusItems/rocket/RocketItemObject';
import { ItemSubObject } from '../bonusItems/ItemSubObject';
import { GridCell } from '../field/GridCell';
import { UnitSubObject } from './units/UnitSubObject';
import { UnitGroupManager } from '../battle/UnitGroupManager';
import { FogSubObject } from './fog/FogSubObject';


const { ccclass, property } = _decorator;

@ccclass('SubObjectGenerator')
export class SubObjectGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    // юниты
    @property({ type: Prefab })
    francePrefab: Prefab | null = null;

    // туман войны
    @property({ type: Prefab })
    fogPrefab: Prefab | null = null;

    // отряды
    @property({ type: [Number] })
    playerUnitGroupSizes: number[] = [];

    @property({ type: [Number] })
    enemyUnitGroupSizes: number[] = [];

    // эффекты как объекты
    @property({ type: Prefab })
    shieldEffectPrefab: Prefab | null = null;   

    // 🟩 Предметы как конфиги
    // мина ловушка
    @property({ type: SpawnConfig })
    playerMineTrapConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemyMineTrapConfig: SpawnConfig = new SpawnConfig();

    // бомба
    @property({ type: SpawnConfig })
    playerBombConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemyBombConfig: SpawnConfig = new SpawnConfig();

    // диверсант
    @property({ type: SpawnConfig })
    playerSaboteurConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemySaboteurConfig: SpawnConfig = new SpawnConfig();

    // ракета
    @property({ type: SpawnConfig })
    playerRocketConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemyRocketConfig: SpawnConfig = new SpawnConfig();

    // щит
    @property({ type: SpawnConfig })
    playerShieldConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig })
    enemyShieldConfig: SpawnConfig = new SpawnConfig();

    public static instance: SubObjectGenerator;

    onLoad() {
        SubObjectGenerator.instance = this;
    }

    start() {
        if (!this.gridManager) return;

        const playerCells = this.gridManager.getPlayerCells();
        const enemyCells = this.gridManager.getEnemyCells();

        const playerPlan = PlacementPlanner.planGroups(playerCells, this.playerUnitGroupSizes, 'player');
        const enemyPlan = PlacementPlanner.planGroups(enemyCells, this.enemyUnitGroupSizes, 'enemy');

        this.instantiateUnits(playerPlan, this.francePrefab, FranceUnitObject);
        this.instantiateUnits(enemyPlan, this.francePrefab, FranceUnitObject);

        this.spawnItem(playerCells, this.playerMineTrapConfig, MineTrapItemObject);
        this.spawnItem(playerCells, this.playerBombConfig, BombItemObject);
        this.spawnItem(playerCells, this.playerSaboteurConfig, SaboteurItemObject);
        this.spawnItem(playerCells, this.playerRocketConfig, RocketItemObject);
        this.spawnItem(playerCells, this.playerShieldConfig, ShieldItemObject);

        this.spawnItem(enemyCells, this.enemyMineTrapConfig, MineTrapItemObject);
        this.spawnItem(enemyCells, this.enemyBombConfig, BombItemObject);
        this.spawnItem(enemyCells, this.enemySaboteurConfig, SaboteurItemObject);
        this.spawnItem(enemyCells, this.enemyRocketConfig, RocketItemObject);
        this.spawnItem(enemyCells, this.enemyShieldConfig, ShieldItemObject);

        this.spawnFog(enemyCells, this.fogPrefab);
    }

    private spawnItem<T extends ItemSubObject & { prefab: Prefab | null }>(
        cells: GridCell[],
        config: SpawnConfig,
        ItemType: new () => T
    ): void {
        if (!config.prefab) return;

        const available = [...cells].filter(cell =>
            !cell.hasAnyMainSubObject()
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

    /** Универсальный метод спавна эффектов по клеткам */
    public spawnEffect<T extends EffectSubObject>(
        EffectType: new (...args: any[]) => T,
        groupId: number,
        cells: GridCell[],
        prefab: Prefab
    ): void {
        for (const cell of cells) {
            const effect = new EffectType(groupId);
            effect.setVisualPrefab(prefab); // ⬅️ здесь ты передаёшь префаб вручную
            cell.attachSubObject(effect);
        }
    }

}
