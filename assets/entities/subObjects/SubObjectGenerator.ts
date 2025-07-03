import { _decorator, Component, Prefab } from 'cc';
import { GridCell } from '../field/GridCell';
import { HexGridManager } from '../field/HexGridManager';
import { PlacementPlanner } from './PlacementPlanner';
import { FogSubObject } from './fog/FogSubObject';
import { UnitGroupGenerator } from './UnitGroupGenerator';
import { ItemSubObject } from '../bonusItems/ItemSubObject';
import { MineTrapItemObject } from '../bonusItems/mine/MineTrapItemObject';
import { BombItemObject } from '../bonusItems/bomb/BombItemObject';
import { RocketItemObject } from '../bonusItems/rocket/RocketItemObject';
import { ShieldItemObject } from '../bonusItems/shield/ShieldItemObject';
import { CaptiveItemObject } from '../bonusItems/captive/CaptiveItemObject';
import { SpawnConfig } from './SpawnConfig';
import { SaboteurItemObject } from '../bonusItems/saboteur/SaboteurItemObject';
import { ShieldEffectSubObject } from '../bonusItems/shieldEffect/ShieldEffectSubObject';
import { EffectSubObject } from './EffectSubObject';

const { ccclass, property } = _decorator;

interface SpawnEntry {
    config: SpawnConfig;
    type: new () => ItemSubObject;
}

@ccclass('SubObjectGenerator')
export class SubObjectGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: UnitGroupGenerator })
    unitGroupGenerator: UnitGroupGenerator | null = null;

    // Префаб для создания тумана войны
    @property({ type: Prefab })
    fogPrefab: Prefab | null = null;

    // Конфигурации предметов игрока
    @property({ type: SpawnConfig }) playerMineTrapConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerBombConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerRocketConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerShieldConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerCaptiveConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) playerSaboteurConfig: SpawnConfig = new SpawnConfig();

    // Конфигурации предметов противника
    @property({ type: SpawnConfig }) enemyMineTrapConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyBombConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyRocketConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyShieldConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemyCaptiveConfig: SpawnConfig = new SpawnConfig();
    @property({ type: SpawnConfig }) enemySaboteurConfig: SpawnConfig = new SpawnConfig();

    // префабы эффектов
    @property({ type: Prefab })
    public shieldEffectPrefab: Prefab | null = null;

    @property
    public useLevelConfig = false;  // 🆕 флаг запуска поля инспектор/конфиг

    public static instance: SubObjectGenerator;

    // Регистры конфигураций предметов по ключам itemId
    public itemConfigs: Record<'player' | 'enemy', Record<string, SpawnConfig>> = {
        player: {},
        enemy: {},
    };

    /**
     * Автоматически регистрирует конфигурации предметов на основе itemId
     */
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

    onLoad() {
        SubObjectGenerator.instance = this;
    }

    start() {
        this.registerItemConfigs(); // Регистрируем предметы по itemId
        if (!this.useLevelConfig) {
            // this.generateObjects();     // Генерируем все субобъекты на сцене
        }
    }

    /**
     * метод активирующий эффекты
     */
    public spawnEffect<T extends EffectSubObject>(
        EffectClass: new (groupId: number) => T,
        groupId: number,
        cells: GridCell[],
        prefab: Prefab
    ): void {
        for (const cell of cells) {
            const effect = new EffectClass(groupId);
            effect.assignPrefab(prefab);
            cell.attachSubObject(effect);
        }
    }

    /**
     * Основной метод генерации: юниты, предметы, туман
     */
    public generateObjects(): void {
        if (!this.gridManager || !this.unitGroupGenerator) return;

        this.unitGroupGenerator.registerUnits();
        this.unitGroupGenerator.generateGroups('player');
        this.unitGroupGenerator.generateGroups('enemy');

        this.generateItemsForSide('player');
        this.generateItemsForSide('enemy');

        this.spawnFog(this.gridManager.getEnemyCells(), this.fogPrefab);
    }

    /**
     * обнуляем количество всех предметов перед загрузкой
     */
    public clearAllCounts() {
        for (const side of ['player', 'enemy'] as const) {
            for (const config of Object.values(this.itemConfigs[side])) {
                config.count = 0;
            }
        }
    }

    /**
     * Генерация предметов для указанной стороны
     */
    private generateItemsForSide(owner: 'player' | 'enemy'): void {
        const cells = owner === 'player'
            ? this.gridManager!.getPlayerCells()
            : this.gridManager!.getEnemyCells();

        const entries: Record<string, new () => ItemSubObject> = {
            mine: MineTrapItemObject,
            bomb: BombItemObject,
            rocket: RocketItemObject,
            shield: ShieldItemObject,
            captive: CaptiveItemObject,
            saboteur: SaboteurItemObject,
        };

        for (const [itemId, ItemClass] of Object.entries(entries)) {
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
                item.onAttachToCell?.(cell); // 🔥 создаёт visualNode и связывает с клеткой

                const cellType = cell.getParameter<number>('type');
                const opened = cell.getParameter<boolean>('opened');

                // 👁️ Скрываем визуал, если это враг и клетка не открыта
                if (cellType === 2 && !opened) {
                    item.setHidden?.(true);
                }
            }
        }
    }

    /**
     * Спавн тумана войны на указанных клетках
     */
    private spawnFog(cells: GridCell[], prefab: Prefab | null): void {
        if (!prefab) return;
        for (const cell of cells) {
            const fog = new FogSubObject();
            fog.fogPrefab = prefab;
            cell.attachSubObject(fog);
        }
    }

    /**
     * Перемешивает массив и возвращает первые count элементов
     */
    private shuffleAndTake<T>(arr: T[], count: number): T[] {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, count);
    }

    /**
     * Устанавливает количество предметов по itemId для каждой стороны
     */
    public setItemCount(owner: 'player' | 'enemy', itemId: string, count: number): void {
        const config = this.itemConfigs[owner][itemId];
        if (config) {
            config.count = count;
        } else {
            console.warn(`[SubObjectGenerator] Не найден конфиг предмета "${itemId}" для стороны "${owner}"`);
        }
    }
}
