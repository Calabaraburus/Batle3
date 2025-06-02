import { GridCell } from './GridCell';
import { HexGridManager } from './HexGridManager';
import { ItemSubObject } from './ItemSubObject';
import { UnitSubObject } from './UnitSubObject';
import { RocketItemObject } from './RocketItemObject';
import { RocketItemStrategy } from './RocketItemStrategy';
import type { ItemStrategy } from './ItemStrategy';
import { ShieldItemObject } from './ShieldItemObject';
import { ShieldItemStrategy } from './ShieldItemStrategy';

export class BattleBot {
    constructor(
        private grid: HexGridManager,           // Ссылка на менеджер поля
        private endTurn: () => void,            // Завершение хода
        private revealCell: (cell: GridCell) => void, // Метод для открытия клетки
        private attackCell: (cell: GridCell) => void // Метод для атаки клетки
    ) {}

    /**
     * Главный метод принятия решения.
     * Порядок: применить предмет → атаковать врага → завершить ход
     */
    public act(): void {
        const cells = this.grid.getAllCells();

        if (this.tryUseItem(cells)) return;
        if (this.tryAttack(cells)) return;

        this.endTurn();
    }

    /**
     * Попытка использовать активные предметы бота.
     * Ищем предметы, готовые к применению, и передаём им стратегию.
     */
    private tryUseItem(cells: GridCell[]): boolean {
        const itemsToActivate = cells
            .filter(c => c.getParameter('type') === 1 && c.getParameter('opened'))
            .flatMap(c => c.getSubObjects())
            .filter(obj => obj instanceof ItemSubObject && !obj.isReadyToUse()) as ItemSubObject[];

        console.log('[BOT] Найдено предметов для проверки:', itemsToActivate.length);

        for (const item of itemsToActivate) {
            if (!item.isReadyToArm()) {
                console.log('[BOT] Активирую предмет:', item.constructor.name);
                item.arm();
            }

            const strategy = this.getStrategyForItem(item);
            if (!strategy) {
                console.warn('[BOT] Нет стратегии для предмета:', item.constructor.name);
                continue;
            }

            const targets = strategy.evaluateTargets(this.grid.getAllCells(), item);
            console.log('[BOT] Целей для применения:', targets.length);

            for (const target of targets) {
                // 🔧 Передаём grid для применения предмета
                if (item.tryApplyEffectTo(target)) {
                    console.log('[BOT] Успешное применение предмета');
                    this.endTurn();
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Попытка атаковать вражескую клетку.
     * Приоритет — клетки возле уже открытых, ранее поражённых.
     */
    private tryAttack(cells: GridCell[]): boolean {
        const unopenedEnemyCells = cells.filter(c =>
            c.getParameter('type') === 1 && !c.getParameter('opened')
        );

        if (unopenedEnemyCells.length === 0) return false;

        const targetedAroundHits = this.getNeighborTargetsAroundHits(cells);

        const target = targetedAroundHits.length > 0
            ? this.getRandom(targetedAroundHits)
            : this.getRandom(unopenedEnemyCells);

        this.attackCell(target); // ✅ всё делает сам
        return true;
    }

    /**
     * Находит клетки рядом с уже поражёнными вражескими юнитами.
     */
    private getNeighborTargetsAroundHits(cells: GridCell[]): GridCell[] {
        const openedDeadUnits = cells.filter(c =>
            c.getParameter('opened') &&
            c.getSubObjects().some(obj => obj instanceof UnitSubObject && !obj.isAlive)
        );

        const neighborTargets = new Set<GridCell>();

        for (const hitCell of openedDeadUnits) {
            for (const neighbor of hitCell.neighbors) {
                if (!neighbor.getParameter('opened') && neighbor.getParameter('type') === 1) {
                    neighborTargets.add(neighbor);
                }
            }
        }

        return Array.from(neighborTargets);
    }

    /**
     * Выбирает стратегию в зависимости от типа предмета.
     */
    private getStrategyForItem(item: ItemSubObject): ItemStrategy | null {
        if (item instanceof RocketItemObject) {
            return new RocketItemStrategy();
        }

        if (item instanceof ShieldItemObject) {
            return new ShieldItemStrategy();
        }

        return null;
    }

    /** Вспомогательная функция выбора случайного элемента */
    private getRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
