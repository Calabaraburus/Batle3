// 📦 Новый класс: отвечает за генерацию макета поля (типов клеток)
export class HexGridLayoutGenerator {
    /**
     * Генерирует разметку поля с заданными параметрами
     * @param cols Кол-во колонок
     * @param rows Кол-во рядов
     * @param total Общее кол-во ячеек
     * @param players Кол-во ячеек игрока
     * @param enemies Кол-во ячеек врага
     */
    static generate(cols: number, rows: number, total: number, players: number, enemies: number, chanceToCluster: number): number[][] {
        const EMPTY = 0;
        const layout: number[][] = Array.from({ length: rows }, () => Array(cols).fill(EMPTY));
        const available: [number, number][] = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                available.push([x, y]);
            }
        }

        const placeTeam = (team: number, count: number, chanceToCluster = 0.8) => {
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

                chance = chanceToCluster;
            }
        };

        placeTeam(1, players, chanceToCluster); // PLAYER = 1
        placeTeam(2, enemies, chanceToCluster); // ENEMY = 2

        return layout;
    }
}
