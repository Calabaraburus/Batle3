import { GridCell } from './GridCell';
import { HexGridManager } from './HexGridManager';
import { ItemSubObject } from './ItemSubObject';
import { UnitSubObject } from './UnitSubObject';
import { BattleController } from './BattleController';

export class EnemyBotController {
    constructor(private grid: HexGridManager) {}

    /** Основной метод принятия решения ИИ */
    public makeDecision(): void {
        // 1. Проверка: есть ли активируемые предметы
        const usableItem = this.findUsableItem();
        if (usableItem) {
            const target = this.findTargetForItem(usableItem);
            if (target) {
                usableItem.arm();
                usableItem.tryApplyEffectTo(target);
                return;
            }
        }

        // 2. Обычная атака
        const attackCell = this.findBestAttackCell();
        if (attackCell) {
            BattleController.instance.openAndRevealCell(attackCell);

            const unit = attackCell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
            if (unit && unit.isAlive) {
                unit.markAsDead();
            }
        }

        BattleController.instance.endTurn();
    }

    /** Находит предмет, который можно активировать */
    private findUsableItem(): ItemSubObject | null {
        const cells = this.grid.getAllCells();
        const myCells = cells.filter(cell => cell.getParameter('type') === 2 && cell.getParameter('opened'));

        for (const cell of myCells) {
            const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
            if (item && !item.isReadyToArm() && !item.isReadyToUse()) {
                return item;
            }
        }

        return null;
    }

    /** Подбирает цель для применения предмета */
    private findTargetForItem(item: ItemSubObject): GridCell | null {
        const cells = this.grid.getAllCells();
        const targets = cells.filter(cell => {
            const isEnemy = cell.getParameter('type') === 1;
            const opened = cell.getParameter('opened') === true;
            return isEnemy && !opened;
        });

        // Можно улучшить: сортировать по уязвимости, важности и т.д.
        return targets.length > 0 ? targets[0] : null;
    }

    /** Поиск лучшей клетки для обычной атаки */
    private findBestAttackCell(): GridCell | null {
        const cells = this.grid.getAllCells();
        const candidates = cells.filter(cell => cell.getParameter('type') === 1 && !cell.getParameter('opened'));

        // Здесь можно внедрить более сложную логику оценки приоритетов
        return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
    }
}
