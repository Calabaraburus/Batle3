import {
    _decorator,
    Component,
    Node,
    Prefab,
    instantiate,
    Vec3,
    UITransform,
    Color,
    Sprite,
} from 'cc';

import { HexCell } from './HexCell';
import { GridCell } from './GridCell';
import { FogSubObject } from './FogSubObject';

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

    private baseWidth = 100;
    private baseHeight = 86.6;
    private targetAspectRatio = 1 / 3;
    private calculatedFieldWidth = 0;
    private grid: GridCell[][] = [];
    private chanceToPlaceAllyHex = 0.8

    onEnable() {
        this.refreshField();
    }

    onDestroy() {
        this.clearGrid();
    }

    refreshField() {
        this.clearGrid();
        this.generateField();
    }

    clearGrid() {
        for (const child of this.node.children) {
            child.destroy();
        }
        this.grid = [];
    }

    generateField() {
        if (!this.hexTilePrefab) return;

        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;

        const containerWidth = uiTransform.contentSize.width;
        const containerHeight = uiTransform.contentSize.height;

        const [cols, rows] = this.calculateBestGridSize(this.totalTileCount);
        const [tileWidth, tileHeight] = this.calculateTileSize(containerWidth, containerHeight, cols, rows);
        const [fieldWidth, fieldHeight] = this.calculateFieldDimensions(cols, rows, tileWidth, tileHeight);

        this.calculatedFieldWidth = fieldWidth;

        const layout = this.generateFuzzyLayout(cols, rows, this.totalTileCount, this.playerTileCount, this.enemyTileCount);
        const origin = this.calculateOrigin(containerWidth, containerHeight, fieldWidth, fieldHeight, tileWidth, tileHeight);

        this.buildFromLayout(layout, tileWidth, tileHeight, origin);
        this.linkNeighbors(cols, rows);
    }

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
                console.log(`[Grid] Placing hex (${x}, ${y}) at world pos:`, tile.getWorldPosition());

                tile.setScale(new Vec3(tileWidth / this.baseWidth, tileHeight / this.baseHeight, 1));

                console.log(`Created HexTile at (${x}, ${y}) → pos (${posX.toFixed(1)}, ${posY.toFixed(1)})`);

                const sprite = tile.getComponent(Sprite);
                if (sprite) {
                    sprite.color = type === PLAYER ? new Color(150, 200, 255) : new Color(255, 150, 150);
                }

                const logicCell = new GridCell();
                logicCell.addParameter('type', type);
                logicCell.addParameter('x', x); // Добавляем координаты
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

                this.grid[y][x] = logicCell;

                // Присваиваем визуальный узел логической ячейке
                logicCell.setVisualNode(tile);
                
            }
        }
    }

    linkNeighbors(cols: number, rows: number) {
        const evenOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, -1]];
        const oddOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1]];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = this.grid[y]?.[x];
                if (!cell) continue;

                const visual = cell.getVisualNode();
                const hex = visual?.getComponent(HexCell);
                if (!hex) continue;

                const offsets = x % 2 === 0 ? evenOffsets : oddOffsets;

                for (const [dx, dy] of offsets) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                        const neighbor = this.grid[ny]?.[nx];
                        const neighborVisual = neighbor?.getVisualNode();
                        const neighborHex = neighborVisual?.getComponent(HexCell);
                        if (neighborHex) {
                            hex.addNeighbor(neighborHex);

                            // ✅ Также добавляем логическую связь
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

    
    getPlayerCells(): GridCell[] {
        return this.getAllCells().filter(cell => cell.getParameter<number>('type') === PLAYER);
    }
    
    getEnemyCells(): GridCell[] {
        return this.getAllCells().filter(cell => cell.getParameter<number>('type') === ENEMY);
    }    

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

    calculateBestGridSize(totalTiles: number): [number, number] {
        let bestCols = 0, bestRows = 0, bestDiff = Number.MAX_VALUE;

        for (let cols = 3; cols <= 50; cols++) {
            const rows = Math.ceil(totalTiles / cols);
            const usedCols = Math.ceil(totalTiles / rows);
            const ratio = rows / usedCols;
            const diff = Math.abs(ratio - this.targetAspectRatio);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestCols = usedCols;
                bestRows = rows;
            }
        }

        return [bestCols, bestRows];
    }

    calculateTileSize(containerWidth: number, containerHeight: number, cols: number, rows: number): [number, number] {
        const tileWidthMax = containerWidth / (1 + (cols - 1) * 0.75);
        const tileHeightMax = containerHeight / (rows + 0.5);

        const tileHeight = Math.min(tileHeightMax, tileWidthMax * (this.baseHeight / this.baseWidth));
        const tileWidth = tileHeight * (this.baseWidth / this.baseHeight);

        return [tileWidth, tileHeight];
    }

    calculateFieldDimensions(cols: number, rows: number, tileWidth: number, tileHeight: number): [number, number] {
        const totalWidth = tileWidth * (1 + 0.75 * (cols - 1));
        const totalHeight = rows * tileHeight + tileHeight * 0.5;
        return [totalWidth, totalHeight];
    }

    calculateOrigin(containerWidth: number, containerHeight: number, fieldWidth: number, fieldHeight: number, tileWidth: number, tileHeight: number): Vec3 {
        const offsetX = (containerWidth - fieldWidth) / 2 + tileWidth / 2;
        const offsetY = (containerHeight - fieldHeight) / 2 + tileHeight / 2;
        return new Vec3(-containerWidth / 2 + offsetX, containerHeight / 2 - offsetY, 0);
    }

    getShiftX(): number {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return 0;
        return (uiTransform.contentSize.width - this.calculatedFieldWidth) / 2;
    }

    updateNodeSize(width: number, height: number) {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(width, height);
        }
    }

    // Получить логическую ячейку по координатам
    public getCell(x: number, y: number): GridCell | null {
        if (this.grid[y] && this.grid[y][x]) {
            return this.grid[y][x];
        }
        return null;
    }

    // Получить все логические ячейки в одном массиве
    public getAllCells(): GridCell[] {
        const all: GridCell[] = [];
        for (const row of this.grid) {
            for (const cell of row) {
                if (cell) all.push(cell);
            }
        }
        return all;
    }

    // Получить все HexCell, размещённые как дочерние ноды поля
    public getAllHexCells(): HexCell[] {
        const result: HexCell[] = [];
    
        for (const row of this.grid) {
            for (const logicalCell of row) {
                const visualNode = logicalCell?.getVisualNode();
                if (visualNode?.isValid) {
                    const hexCell = visualNode.getComponent(HexCell);
                    if (hexCell) {
                        result.push(hexCell);
                        console.log(`[Grid] Found HexCell at (${hexCell.gridX}, ${hexCell.gridY}) — worldPos: ${visualNode.worldPosition}`);
                    }
                }
            }
        }
    
        console.log(`[Grid] Total HexCells collected: ${result.length}`);
        return result;
    }   

    // Раскрытие клетки (например, при атаке)
    public revealCell(cell: GridCell): void {
        // Удаляем все субобъекты типа FogSubObject
        const fogs = cell.getSubObjects().filter(sub => sub instanceof FogSubObject);
        for (const fog of fogs) {
            cell.detachSubObject(fog);
        }

        // Дополнительно можно обновить визуал, если нужно
    }

        /**
     * Возвращает все визуальные HexCell, которые размещены на поле.
     */
    getAllVisualCells(): HexCell[] {
        const cells: HexCell[] = [];
        this.node.children.forEach(child => {
            const hexCell = child.getComponent(HexCell);
            if (hexCell) {
                cells.push(hexCell);
            }
        });
        return cells;
    }



}
