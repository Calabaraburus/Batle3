// Модуль утилит для расчётов, связанных с гексагональной сеткой

import { Vec3 } from "cc";
import { GridCell } from "./GridCell";
import { BattleController } from "../battle/BattleController";

export class HexGridUtils {
    /**
     * Вычисляет оптимальное количество столбцов и строк,
     * стремясь к заданному соотношению сторон.
     */
    public static calculateBestGridSize(totalTiles: number, targetAspectRatio = 0.5): [number, number] {
        let bestCols = 0, bestRows = 0, bestDiff = Number.MAX_VALUE;

        for (let cols = 3; cols <= 50; cols++) {
            const rows = Math.ceil(totalTiles / cols);
            const usedCols = Math.ceil(totalTiles / rows);
            const ratio = rows / usedCols;
            const diff = Math.abs(ratio - targetAspectRatio);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestCols = usedCols;
                bestRows = rows;
            }
        }

        return [bestCols, bestRows];
    }

    /**
     * Вычисляет оптимальные размеры одного тайла с учётом размеров контейнера
     */
    public static calculateTileSize(
        containerWidth: number,
        containerHeight: number,
        cols: number,
        rows: number,
        baseWidth: number,
        baseHeight: number
    ): [number, number] {
        const tileWidthMax = containerWidth / (1 + (cols - 1) * 0.75);
        const tileHeightMax = containerHeight / (rows + 0.5);

        const tileHeight = Math.min(tileHeightMax, tileWidthMax * (baseHeight / baseWidth));
        const tileWidth = tileHeight * (baseWidth / baseHeight);

        return [tileWidth, tileHeight];
    }

    /**
     * Вычисляет итоговые размеры сетки в пикселях
     */
    public static calculateFieldDimensions(cols: number, rows: number, tileWidth: number, tileHeight: number): [number, number] {
        const totalWidth = tileWidth * (1 + 0.75 * (cols - 1));
        const totalHeight = rows * tileHeight + tileHeight * 0.5;
        return [totalWidth, totalHeight];
    }

    /**
     * Вычисляет смещение сетки по X и Y относительно центра родительского контейнера
     */
    public static calculateOrigin(
        containerWidth: number,
        containerHeight: number,
        fieldWidth: number,
        fieldHeight: number,
        tileWidth: number,
        tileHeight: number
    ): Vec3 {
        const offsetX = (containerWidth - fieldWidth) / 2 + tileWidth / 2;
        const offsetY = (containerHeight - fieldHeight) / 2 + tileHeight / 2;
        return new Vec3(-containerWidth / 2 + offsetX, containerHeight / 2 - offsetY, 0);
    }

}


    const evenDirectionOffsets = [
        { dx: 0, dy: -1 },   // 0: вверх
        { dx: 1, dy: -1 },   // 1: вверх-право
        { dx: 1, dy: 0 },    // 2: вниз-право
        { dx: 0, dy: 1 },    // 3: вниз
        { dx: -1, dy: 0 },   // 4: вниз-лево
        { dx: -1, dy: -1 },  // 5: вверх-лево
    ];

    const oddDirectionOffsets = [
        { dx: 0, dy: -1 },   // 0: вверх
        { dx: 1, dy: 0 },    // 1: вверх-право
        { dx: 1, dy: 1 },    // 2: вниз-право
        { dx: 0, dy: 1 },    // 3: вниз
        { dx: -1, dy: 1 },   // 4: вниз-лево
        { dx: -1, dy: 0 },   // 5: вверх-лево
    ];

    export function getNeighborInDirection(cell: GridCell, direction: number): GridCell | null {
        const x = cell.getParameter<number>('x');
        const y = cell.getParameter<number>('y');

        if (x === undefined || y === undefined) return null;

        const offsets = x % 2 === 0 ? evenDirectionOffsets : oddDirectionOffsets;
        const offset = offsets[direction];

        const nx = x + offset.dx;
        const ny = y + offset.dy;

        console.log(`[Rocket] Исходная: (${x},${y}), четность x: ${x % 2}`);
        console.log(`[Rocket] Смещение: dx=${offset.dx}, dy=${offset.dy}`);
        console.log(`[Rocket] Цель: (${nx},${ny})`);

        return BattleController.instance.gridManager!.getCell(nx, ny);
    }
