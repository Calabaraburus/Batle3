import { _decorator, Component, Prefab } from 'cc';
import { GridCell } from '../field/GridCell';
import { HexGridManager } from '../field/HexGridManager';
import { FogSubObject } from './fog/FogSubObject';
import { UnitGroupGenerator } from './UnitGroupGenerator';
import { ItemSubObject } from '../bonusItems/ItemSubObject';
import { MineTrapItemObject } from '../bonusItems/mine/MineTrapItemObject';
import { BombItemObject } from '../bonusItems/bomb/BombItemObject';
import { RocketItemObject } from '../bonusItems/rocket/RocketItemObject';
import { ShieldItemObject } from '../bonusItems/shield/ShieldItemObject';
import { CaptiveItemObject } from '../bonusItems/captive/CaptiveItemObject';
import { SaboteurItemObject } from '../bonusItems/saboteur/SaboteurItemObject';
import { SpawnConfig } from './SpawnConfig';
import { EffectSubObject } from './EffectSubObject';

const { ccclass, property } = _decorator;

@ccclass('SubObjectGenerator')
export class SubObjectGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: UnitGroupGenerator })
    unitGroupGenerator: UnitGroupGenerator | null = null;

    @property({ type: Prefab })
    fogPrefab: Prefab | null = null;

    // эффекты как объекты
    @property({ type: Prefab })
    shieldEffectPrefab: Prefab | null = null; 

    @property({ type: SpawnConfig }) playerMineTrapConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerBombConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerRocketConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerShieldConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerCaptiveConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerSaboteurConfig: SpawnConfig = new SpawnConfig();

    @property({ type: SpawnConfig }) enemyMineTrapConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyBombConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyRocketConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyShieldConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyCaptiveConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemySaboteurConfig: SpawnConfig = new SpawnConfig();

    @property
    public useLevelConfig = false;

    public static instance: SubObjectGenerator;

    public itemConfigs: Record<'player' | 'enemy', Record<string, SpawnConfig>> = {
        player: {},
        enemy: {},
    };

    public itemClasses: Record<string, new () => ItemSubObject> = {
        shield: ShieldItemObject,
        rocket: RocketItemObject,
        bomb: BombItemObject,
        mine: MineTrapItemObject,
        captive: CaptiveItemObject,
        saboteur: SaboteurItemObject,
    };

    onLoad() {
        SubObjectGenerator.instance = this;
    }

    start() {
        this.registerItemConfigs();

        if (!this.useLevelConfig) {
            this.generateObjects();
        }
    }

    public registerItemConfigs(): void {
        const playerConfigs = [
            this.playerMineTrapConfig,
            this.playerBombConfig,
            this.playerRocketConfig,
            this.playerShieldConfig,
            this.playerCaptiveConfig,
            this.playerSaboteurConfig,
        ];
        const enemyConfigs = [
            this.enemyMineTrapConfig,
            this.enemyBombConfig,
            this.enemyRocketConfig,
            this.enemyShieldConfig,
            this.enemyCaptiveConfig,
            this.enemySaboteurConfig,
        ];

        for (const config of playerConfigs) {
            if (config.itemId) {
                this.itemConfigs.player[config.itemId] = config;
            }
        }
        for (const config of enemyConfigs) {
            if (config.itemId) {
                this.itemConfigs.enemy[config.itemId] = config;
            }
        }
    }

    public async generateObjects(): Promise<void> {
        if (!this.gridManager || !this.unitGroupGenerator) return;

        this.unitGroupGenerator.registerUnits();
        this.unitGroupGenerator.generateGroups('player');
        this.unitGroupGenerator.generateGroups('enemy');

        this.generateItemsForSide('player');
        this.generateItemsForSide('enemy');

        this.spawnFog(this.gridManager.getEnemyCells(), this.fogPrefab);
    }

    public clearAllCounts(): void {
        for (const side of ['player', 'enemy'] as const) {
            for (const config of Object.values(this.itemConfigs[side])) {
                config.count = 0;
            }
        }
    }

    private generateItemsForSide(owner: 'player' | 'enemy'): void {
        const cells = owner === 'player'
            ? this.gridManager!.getPlayerCells()
            : this.gridManager!.getEnemyCells();

        for (const [itemId, ItemClass] of Object.entries(this.itemClasses)) {
            const config = this.itemConfigs[owner][itemId];
            if (!config || !config.prefab || config.count <= 0) continue;

            const availableCells = this.shuffleAndTake(
                cells.filter(cell => !cell.hasAnyMainSubObject()),
                config.count
            );

            for (const cell of availableCells) {
                const item = new ItemClass();
                item.prefab = config.prefab;
                cell.attachSubObject(item);
                item.onAttachToCell?.(cell);

                const cellType = cell.getParameter<number>('type');
                const opened = cell.getParameter<boolean>('opened');

                if (cellType === 2 && !opened) {
                    item.setHidden?.(true);
                }
            }
        }
    }

    /** Универсальный метод спавна эффектов */
    public spawnEffect<T extends EffectSubObject>(
        EffectType: new (groupId?: number) => T,
        prefab: Prefab,
        cells: GridCell[],
        useGroupId = false
    ): void {
        const groupId = useGroupId && (EffectType as any).createGroupId ? (EffectType as any).createGroupId() : undefined;

        for (const cell of cells) {
            const effect = groupId !== undefined ? new EffectType(groupId) : new EffectType();
            effect.setVisualPrefab(prefab);
            cell.attachSubObject(effect);
        }
    }

    public spawnFog(cells: GridCell[], prefab: Prefab | null): void {
        if (!prefab) return;
        for (const cell of cells) {
            const fog = new FogSubObject();
            fog.fogPrefab = prefab;
            cell.attachSubObject(fog);
        }
    }

    private shuffleAndTake<T>(arr: T[], count: number): T[] {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, count);
    }

    public setItemCount(owner: 'player' | 'enemy', itemId: string, count: number): void {
        const config = this.itemConfigs[owner][itemId];
        if (config) {
            config.count = count;
        } else {
            console.warn(`[SubObjectGenerator] Не найден конфиг предмета "${itemId}" для стороны "${owner}"`);
        }
    }
}
