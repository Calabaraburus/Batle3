import { _decorator, Component, Node } from 'cc';
import { HexGridManager } from '../field/HexGridManager';
import { SubObjectGenerator } from '../subObjects/SubObjectGenerator';
import { UnitGroupGenerator } from '../subObjects/UnitGroupGenerator';
import { VictoryChecker, VictoryCondition } from '../../resources/levels/VictoryChecker';
import { GameContext } from '../menu/GameContext';
import { JsonAsset, resources } from 'cc';
import { MissionDescriptionPanel } from './MissionDescriptionPanel';

const { ccclass, property } = _decorator;

/**
 * Структура конфигурации уровня
 */
export interface LevelConfig {
  totalTiles: number;
  playerTiles: number;
  enemyTiles: number;
  playerUnits: number[];
  enemyUnits: number[];
  playerItems: Record<string, number>;
  enemyItems: Record<string, number>;
  victoryCondition: {
    type: string;
    [key: string]: any; // если будут параметры типа "count", "zone", и т.д.
  };
}

@ccclass('LevelManager')
export class LevelManager extends Component {
    public static instance: LevelManager;

    @property({ type: HexGridManager })
    private gridManager: HexGridManager | null = null;

    @property({ type: SubObjectGenerator })
    private objectGenerator: SubObjectGenerator | null = null;

    @property({ type: UnitGroupGenerator })
    private unitGroupGenerator: UnitGroupGenerator | null = null;

    @property({ type: Node }) 
    levelStartWindow: Node | null = null; // окно информации об уровне перед боем

    onLoad() {
        LevelManager.instance = this;
    }

    /**
     * Загружает уровень из JSON-файла по имени
     */
    public async loadLevelFromJson(levelName: string): Promise<void> {
        const path = `levels/${levelName}`; // без .json и без "resources/"
        try {
            const asset = await this.loadJsonAsset(path);
            if (!asset || !asset.json) {
                throw new Error(`[LevelManager] JsonAsset is null or invalid at path: ${path}`);
            }
            this.loadLevel(asset.json as LevelConfig);
        } catch (error) {
            console.error(`[LevelManager] Failed to load level '${levelName}':`, error);
        }
    }

    private loadJsonAsset(path: string): Promise<JsonAsset> {
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (err, asset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            });
        });
    }

    /**
     * Загружает уровень по объекту конфигурации
     */
    public loadLevel(config: LevelConfig): void {
        if (!this.gridManager || !this.objectGenerator || !this.unitGroupGenerator) {
            console.error('[LevelManager] Объекты GridManager, UnitGroupGenerator или SubObjectGenerator не назначены');
            return;
        }
        // 0. передаем в инфо окно данные об уровне
        if (this.levelStartWindow){
                if (this.levelStartWindow?.active === false) {
                this.levelStartWindow.active = true;
            }

            const panel = this.levelStartWindow?.getComponent(MissionDescriptionPanel);
            panel?.setLevelInfo(config);
        }
        

        // 1. Генерация поля по количеству клеток
        this.gridManager.totalTileCount = config.totalTiles;
        this.gridManager.playerTileCount = config.playerTiles;
        this.gridManager.enemyTileCount = config.enemyTiles;
        this.gridManager.generateField();

        // 2. Передача размеров групп юнитов в генератор
        this.unitGroupGenerator.playerGroupSizes = config.playerUnits;
        this.unitGroupGenerator.enemyGroupSizes = config.enemyUnits;

        // 3. Установка ссылок на генераторы
        this.objectGenerator.gridManager = this.gridManager;
        this.objectGenerator.unitGroupGenerator = this.unitGroupGenerator;

        // 4. Установка количества предметов
        this.objectGenerator?.clearAllCounts(); //обнул всех предметов полученных из инспектора
        for (const [itemId, count] of Object.entries(config.playerItems)) {
            this.objectGenerator.setItemCount('player', itemId, count);
        }

        for (const [itemId, count] of Object.entries(config.enemyItems)) {
            this.objectGenerator.setItemCount('enemy', itemId, count);
        }

        // 5. Генерация всех объектов: юниты, предметы, туман
        this.objectGenerator.generateObjects();

        // 6. Инициализация условия победы
        VictoryChecker.resetInstance();
        new VictoryChecker(config.victoryCondition as VictoryCondition);

    }
}
