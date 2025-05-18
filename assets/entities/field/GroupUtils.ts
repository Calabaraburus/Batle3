import { GridCell } from './GridCell';

/**
 * Пытается сгенерировать связанный набор клеток указанного размера.
 * Делает несколько попыток (по умолчанию 10), чтобы найти связанное множество.
 */
export function generateConnectedGroup(
    availableCells: GridCell[],
    groupSize: number,
    maxAttempts = 10
): GridCell[] {
    if (availableCells.length === 0 || groupSize <= 0) return [];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result: GridCell[] = [];
        const used = new Set<GridCell>();

        // Случайный старт
        const start = availableCells[Math.floor(Math.random() * availableCells.length)];
        result.push(start);
        used.add(start);

        while (result.length < groupSize) {
            const neighbors: GridCell[] = [];

            for (const cell of result) {
                for (const n of cell.neighbors) {
                    if (!used.has(n) && availableCells.includes(n)) {
                        neighbors.push(n);
                    }
                }
            }

            if (neighbors.length === 0) break;

            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            result.push(next);
            used.add(next);
        }

        // ✅ Успешно
        if (result.length === groupSize) {
            return result;
        }
    }

    // ❌ Не удалось
    return [];
}
