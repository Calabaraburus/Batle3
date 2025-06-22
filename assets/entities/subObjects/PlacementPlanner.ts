import { GridCell } from './GridCell';

export interface GroupPlan {
    cells: GridCell[];
    groupId: string;
}

export class PlacementPlanner {
    /**
     * Планирует размещение всех групп. Делает до 20 попыток.
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

                const groupCells = this.generateConnectedGroup(pool, size);

                if (groupCells.length !== size) {
                    success = false;
                    break;
                }

                result.push({ cells: groupCells, groupId });

                // Удаляем занятые и соседние ячейки из пула
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
     * Находит связанный блок клеток указанного размера
     */
    private static generateConnectedGroup(candidates: GridCell[], size: number, maxAttempts = 10): GridCell[] {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (candidates.length === 0) break;

            const result: GridCell[] = [];
            const used = new Set<GridCell>();

            const start = candidates[Math.floor(Math.random() * candidates.length)];
            result.push(start);
            used.add(start);

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
