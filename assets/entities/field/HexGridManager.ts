import {
    _decorator,
    Component,
    Node,
    Prefab,
    instantiate,
    Vec3,
    UITransform,
} from 'cc';

import { HexCell } from './HexCell';
import { GridCell } from './GridCell';
import { FogSubObject } from '../subObjects/fog/FogSubObject';
import { HexGridUtils } from './HexGridUtils';
import { HexGridLayoutGenerator } from './HexGridLayoutGenerator';

const { ccclass, property, executeInEditMode } = _decorator;

const EMPTY = 0;
const PLAYER = 1;
const ENEMY = 2;

@ccclass('HexGridManager')
@executeInEditMode()
export class HexGridManager extends Component {
    @property({ type: Prefab }) hexTilePrefab: Prefab | null = null;
    @property({ type: Prefab }) fogPrefab: Prefab | null = null;
    @property playerTileCount = 100;
    @property enemyTileCount = 100;
    @property totalTileCount = 150;

    @property
    public useLevelConfig = false;  // 🆕 флаг запуска поля инспектор/конфиг
    private wasCleared = false; // защита от повторной очистки

    private baseWidth = 98;
    private baseHeight = 64;
    private targetAspectRatio = 0.5;
    private calculatedFieldWidth = 0;
    private grid: GridCell[][] = [];
    private chanceToPlaceAllyHex = 0.8;

    onEnable() {
        if (!this.useLevelConfig) {
            this.refreshField();
        }
    }

    onDestroy() {
        // this.clearGrid();
    }

    /** Полное обновление поля */
    refreshField() {
        this.clearGrid();
        this.generateField();
    }

    /** Удаление всех дочерних узлов и очистка grid-массива */
    clearGrid() {
        if (this.wasCleared) return;
        this.wasCleared = true;

        for (const child of [...this.node.children]) {
            if (child && child.isValid) {
                child.destroy();
            }
        }
        this.grid = [];
    }

    /** Генерация поля из настроек */
    generateField() {
        if (!this.hexTilePrefab) return;

        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;

        const containerWidth = uiTransform.contentSize.width;
        const containerHeight = uiTransform.contentSize.height;

        const [cols, rows] = HexGridUtils.calculateBestGridSize(this.totalTileCount, this.targetAspectRatio);
        const [tileWidth, tileHeight] = HexGridUtils.calculateTileSize(containerWidth, containerHeight, cols, rows, this.baseWidth, this.baseHeight);
        const [fieldWidth, fieldHeight] = HexGridUtils.calculateFieldDimensions(cols, rows, tileWidth, tileHeight);

        this.calculatedFieldWidth = fieldWidth;

        const layout = HexGridLayoutGenerator.generate(cols, rows, this.totalTileCount, this.playerTileCount, this.enemyTileCount);
        const origin = HexGridUtils.calculateOrigin(containerWidth, containerHeight, fieldWidth, fieldHeight, tileWidth, tileHeight);

        this.buildFromLayout(layout, tileWidth, tileHeight, origin);
        this.linkNeighbors(cols, rows);
    }

    /** Создание тайлов по макету */
    buildFromLayout(layout: number[][], tileWidth: number, tileHeight: number, origin: Vec3) {
        for (let y = 0; y < layout.length; y++) {
            this.grid[y] = [];

            for (let x = 0; x < layout[y].length; x++) {
                const type = layout[y][x];
                if (type === EMPTY) {
                    this.grid[y][x] = null!;
                    continue;
                }

                const tile = instantiate(this.hexTilePrefab!) as Node;
                this.node.addChild(tile);

                const offsetY = (x % 2) * (tileHeight * 0.5);
                const posX = origin.x + x * tileWidth * 0.75;
                const posY = origin.y - y * tileHeight - offsetY;

                tile.setPosition(new Vec3(posX, posY, 0));
                tile.setScale(new Vec3(tileWidth / this.baseWidth, tileHeight / this.baseHeight, 1));

                const logicCell = new GridCell();
                logicCell.addParameter('type', type);
                logicCell.addParameter('x', x);
                logicCell.addParameter('y', y);

                const hexCell = tile.getComponent(HexCell);
                if (!hexCell) {
                    console.warn('HexCell component not found!');
                    continue;
                }

                hexCell.gridX = x;
                hexCell.gridY = y;
                hexCell.cellType = type;
                hexCell.setLogicalCell(logicCell);
                logicCell.setVisualNode(tile);

                this.grid[y][x] = logicCell;
            }
        }
    }

    /** Связывает гексы с соседями */
    linkNeighbors(cols: number, rows: number) {
        const evenOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, -1]];
        const oddOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1]];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = this.grid[y]?.[x];
                if (!cell) continue;

                const hex = cell.getVisualNode()?.getComponent(HexCell);
                if (!hex) continue;

                const offsets = x % 2 === 0 ? evenOffsets : oddOffsets;

                for (const [dx, dy] of offsets) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                        const neighbor = this.grid[ny]?.[nx];
                        const neighborHex = neighbor?.getVisualNode()?.getComponent(HexCell);
                        if (neighborHex) {
                            hex.addNeighbor(neighborHex);
                            const neighborCell = neighborHex.getLogicalCell();
                            if (neighborCell && !cell.neighbors.includes(neighborCell)) {
                                cell.neighbors.push(neighborCell);
                            }
                        }
                    }
                }
            }
        }
    }

    // ======= Access Helpers ========

    getPlayerCells(): GridCell[] {
        return this.getAllCells().filter(cell => cell.getParameter<number>('type') === PLAYER);
    }

    getEnemyCells(): GridCell[] {
        return this.getAllCells().filter(cell => cell.getParameter<number>('type') === ENEMY);
    }

    getCell(x: number, y: number): GridCell | null {
        return this.grid[y]?.[x] ?? null;
    }

    getAllCells(): GridCell[] {
        return this.grid.flat().filter(Boolean) as GridCell[];
    }

    getAllHexCells(): HexCell[] {
        return this.getAllCells()
            .map(cell => cell.getVisualNode()?.getComponent(HexCell))
            .filter((hex): hex is HexCell => !!hex);
    }

    getAllVisualCells(): HexCell[] {
        return this.node.children
            .map(child => child.getComponent(HexCell))
            .filter((hex): hex is HexCell => !!hex);
    }

    getShiftX(): number {
        const uiTransform = this.node.getComponent(UITransform);
        return uiTransform ? (uiTransform.contentSize.width - this.calculatedFieldWidth) / 2 : 0;
    }

    updateNodeSize(width: number, height: number) {
        this.node.getComponent(UITransform)?.setContentSize(width, height);
    }

    /** Раскрытие клетки (удаление тумана) */
    revealCell(cell: GridCell): void {
        const fogs = cell.getSubObjects().filter(sub => sub instanceof FogSubObject);
        for (const fog of fogs) {
            cell.detachSubObject(fog);
        }
    }

    /** Генерация рассредоточенного макета размещения тайлов */
    generateFuzzyLayout(cols: number, rows: number, total: number, players: number, enemies: number): number[][] {
        const layout: number[][] = Array.from({ length: rows }, () => Array(cols).fill(EMPTY));
        const available: [number, number][] = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                available.push([x, y]);
            }
        }

        const placeTeam = (team: number, count: number) => {
            let placed = 0;
            let chance = 1.0;
            const temp: [number, number][] = [];

            while (placed < count && available.length > 0) {
                let i: number;

                if (temp.length === 0 || Math.random() > chance) {
                    i = Math.floor(Math.random() * available.length);
                } else {
                    const [bx, by] = temp[Math.floor(Math.random() * temp.length)];
                    const neighbors = [
                        [bx - 1, by], [bx + 1, by],
                        [bx, by - 1], [bx, by + 1],
                        [bx - 1, by - 1], [bx + 1, by - 1],
                        [bx - 1, by + 1], [bx + 1, by + 1],
                    ].filter(([nx, ny]) =>
                        nx >= 0 && ny >= 0 && nx < cols && ny < rows && layout[ny][nx] === EMPTY
                    ) as [number, number][];

                    if (neighbors.length === 0) {
                        chance = 1.0;
                        continue;
                    }

                    const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
                    i = available.findIndex(([x, y]) => x === nx && y === ny);
                }

                if (i === -1) break;

                const [x, y] = available.splice(i, 1)[0];
                layout[y][x] = team;
                temp.push([x, y]);
                placed++;

                chance *= this.chanceToPlaceAllyHex;
            }
        };

        placeTeam(PLAYER, players);
        placeTeam(ENEMY, enemies);

        return layout;
    }
}
