import { RocketItemStrategy } from './RocketItemStrategy';
import type { ItemStrategy } from './ItemStrategy';
import { ShieldItemStrategy } from './ShieldItemStrategy';
import { HexGridManager } from '../field/HexGridManager';
import { GridCell } from '../field/GridCell';
import { ItemSubObject } from '../bonusItems/ItemSubObject';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';
import { RocketItemObject } from '../bonusItems/rocket/RocketItemObject';
import { ShieldItemObject } from '../bonusItems/shield/ShieldItemObject';
import { BattleController } from '../battle/BattleController';
import { ItemManager } from '../battle/ItemManager';
import { TurnManager } from '../battle/TurnManager';
import { VictoryChecker } from '../../resources/levels/VictoryChecker';
import { SaboteurItemObject } from '../bonusItems/saboteur/SaboteurItemObject';
import { SaboteurItemStrategy } from './SaboteurItemStrategy';

export class BattleBot {
    constructor(
        private grid: HexGridManager,
        private endTurn: () => void,
        private revealCell: (cell: GridCell) => void,
        private attackCell: (cell: GridCell) => void
    ) {}

    /** Основной метод поведения бота */
    public async act(): Promise<void> {
        if (TurnManager.instance.isTurnFrozen()) return; // ✅ Защита
        const cells = this.grid.getAllCells();

        const usedItem = await this.tryUseItems(cells);

        const canAttack = cells.some(c =>
            c.getParameter('type') === 1 && !c.getParameter('opened')
        );

        if (canAttack) {
            this.tryAttack(cells); // ✅ завершит ход
        } else if (!usedItem) {
            this.endTurn(); // 💤 ничего не сделал — конец хода
        }
    }

    /** Попытка применить все доступные предметы */
    private async tryUseItems(cells: GridCell[]): Promise<boolean> {
        const items = cells
            .filter(c => c.getParameter('type') === 1 && c.getParameter('opened'))
            .flatMap(c => c.getSubObjects())
            .filter(obj => obj instanceof ItemSubObject && !obj.isReadyToUse()) as ItemSubObject[];

        console.log('[BOT] Найдено предметов для проверки:', items.length);
        let usedAtLeastOne = false;

        for (const item of items) {
            if (!item.isReadyToArm()) {
                console.log('[BOT] Активирую предмет:', item.constructor.name);
                item.arm();
            }

            const strategy = this.getStrategyForItem(item);
            if (!strategy) {
                console.warn('[BOT] Нет стратегии для предмета:', item.constructor.name);
                continue;
            }

            const targets = strategy.evaluateTargets(cells, item);
            console.log(`[BOT] Целей для применения (${item.constructor.name}):`, targets.length);

            for (const target of targets) {
                const applied = item.tryApplyEffectTo(target);
                if (applied) {
                    console.log('[BOT] Применил предмет:', item.constructor.name);
                    usedAtLeastOne = true;

                    // 💣 Автотриггеры после применения
                    await ItemManager.instance.tryAutoTriggerItems();
                    VictoryChecker.instance?.checkVictory();
                    break;
                }
            }
        }

        return usedAtLeastOne;
    }

    /** Попытка атаковать ячейку — завершает ход */
    private tryAttack(cells: GridCell[]): boolean {
        const unopenedEnemies = cells.filter(c =>
            c.getParameter('type') === 1 && !c.getParameter('opened')
        );
        if (unopenedEnemies.length === 0) return false;

        const priorityTargets = this.getNeighborTargetsAroundHits(cells);
        const target = priorityTargets.length > 0
            ? this.getRandom(priorityTargets)
            : this.getRandom(unopenedEnemies);

        this.attackCell(target);
        return true;
    }

    /** Возвращает клетки возле убитых юнитов */
    private getNeighborTargetsAroundHits(cells: GridCell[]): GridCell[] {
        const hits = cells.filter(c =>
            c.getParameter('opened') &&
            c.getParameter('type') === 1 &&
            c.getSubObjects().some(obj => obj instanceof UnitSubObject && !obj.isAlive)
        );

        const result = new Set<GridCell>();
        for (const cell of hits) {
            for (const neighbor of cell.neighbors) {
                if (!neighbor.getParameter('opened') && neighbor.getParameter('type') === 1) {
                    result.add(neighbor);
                }
            }
        }

        return Array.from(result);
    }

    /** Возвращает стратегию для конкретного предмета */
    private getStrategyForItem(item: ItemSubObject): ItemStrategy | null {
        if (item instanceof RocketItemObject) return new RocketItemStrategy();
        if (item instanceof ShieldItemObject) return new ShieldItemStrategy();
        if (item instanceof SaboteurItemObject) return new SaboteurItemStrategy();
        return null;
    }

    private getRandom<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
