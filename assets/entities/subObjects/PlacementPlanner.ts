import { GridCell } from "../field/GridCell";

/**
 * Описание группы — список ячеек и уникальный ID
 */
export interface GroupPlan {
    cells: GridCell[];
    groupId: string;
}

export class PlacementPlanner {
    /**
     * Планирует размещение всех групп, возвращая список с привязкой к ячейкам и ID групп.
     * Попытки повторяются до maxAttempts раз (по умолчанию 20), если не удаётся разместить все группы.
     */
    public static planGroups(
        availableCells: GridCell[],
        groupSizes: number[],
        prefix: string,
        maxAttempts = 20
    ): GroupPlan[] {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const result: GroupPlan[] = [];
            const pool = [...availableCells].filter(c => !c.hasAnyMainSubObject());

            let success = true;

            for (let i = 0; i < groupSizes.length; i++) {
                const size = groupSizes[i];
                const groupId = `${prefix}_group_${Date.now()}_${i}`;

                // Пытаемся сгенерировать связанный набор ячеек нужного размера
                const groupCells = this.generateConnectedGroup(pool, size);

                if (groupCells.length !== size) {
                    success = false; // если не удалось — перезапускаем попытку
                    break;
                }

                result.push({ cells: groupCells, groupId });

                // Удаляем занятые и соседние клетки из пула, чтобы избежать наложений
                for (const cell of groupCells) {
                    const index = pool.indexOf(cell);
                    if (index !== -1) pool.splice(index, 1);

                    for (const n of cell.neighbors) {
                        const ni = pool.indexOf(n);
                        if (ni !== -1) pool.splice(ni, 1);
                    }
                }
            }

            if (success) return result;
        }

        console.warn('[PlacementPlanner] Не удалось разместить все группы за 20 попыток.');
        return [];
    }

    /**
     * Генерирует связанный кластер клеток нужного размера
     * Пытается до maxAttempts раз. Используется поиск по соседям.
     */
    private static generateConnectedGroup(
        candidates: GridCell[],
        size: number,
        maxAttempts = 10
    ): GridCell[] {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (candidates.length === 0) break;

            const result: GridCell[] = [];
            const used = new Set<GridCell>();

            // Выбираем случайную стартовую ячейку
            const start = candidates[Math.floor(Math.random() * candidates.length)];
            result.push(start);
            used.add(start);

            // Расширяем группу через соседей
            while (result.length < size) {
                const neighbors: GridCell[] = [];

                for (const cell of result) {
                    for (const n of cell.neighbors) {
                        if (!used.has(n) && candidates.includes(n)) {
                            neighbors.push(n);
                        }
                    }
                }

                if (neighbors.length === 0) break;

                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                result.push(next);
                used.add(next);
            }

            if (result.length === size) return result;
        }

        return [];
    }
}
