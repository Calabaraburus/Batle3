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
const { ccclass, property, executeInEditMode } = _decorator;

const EMPTY = 0;
const PLAYER = 1;
const ENEMY = 2;

@ccclass('HexGridManager')
@executeInEditMode()
export class HexGridManager extends Component {
    @property({ type: Prefab }) hexTilePrefab: Prefab | null = null;
    @property playerTileCount = 100;
    @property enemyTileCount = 100;
    @property totalTileCount = 150;

    private baseWidth = 100;
    private baseHeight = 86.6;
    private targetAspectRatio = 1 / 3;

    private calculatedFieldWidth = 0;

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

    buildFromLayout(layout: number[][], tileWidth: number, tileHeight: number, origin: Vec3) {
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const type = layout[y][x];
                if (type === EMPTY) continue;

                const tile = instantiate(this.hexTilePrefab!) as Node;
                this.node.addChild(tile);

                const offsetY = (x % 2) * (tileHeight * 0.5);
                const posX = origin.x + x * tileWidth * 0.75;
                const posY = origin.y - y * tileHeight - offsetY;

                tile.setPosition(new Vec3(posX, posY, 0));
                tile.setScale(new Vec3(tileWidth / this.baseWidth, tileHeight / this.baseHeight, 1));

                const sprite = tile.getComponent(Sprite);
                if (sprite) {
                    sprite.color = type === PLAYER ? new Color(150, 200, 255) : new Color(255, 150, 150);
                }
            }
        }
    }

    generateFuzzyLayout(cols: number, rows: number, total: number, players: number, enemies: number): number[][] {
        const EMPTY = 0;
        const PLAYER = 1;
        const ENEMY = 2;
    
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
                    // Случайная начальная точка
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
                    ) as [number, number][]; // ЯВНО УКАЗЫВАЕМ ТИП
                
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
    
                chance *= 0.75;
            }
        };
    
        placeTeam(PLAYER, players);
        placeTeam(ENEMY, enemies);
    
        return layout;
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
}
