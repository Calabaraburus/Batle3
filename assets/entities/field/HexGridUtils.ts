// Модуль утилит для расчётов, связанных с гексагональной сеткой

import { Vec3 } from "cc";

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
