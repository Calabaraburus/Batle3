import { GridCell } from '../field/GridCell';
import { ShieldEffectSubObject } from '../bonusItems/shieldEffect/ShieldEffectSubObject';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';
import { ScoreManager } from '../pointsSystem/ScoreManager';
import { VisualEffectPlayer } from '../battleEffects/VisualEffectPlayer';
import { TurnManager } from './TurnManager';
import { UnitGroupManager } from './UnitGroupManager';
import { BattleController } from './BattleController';
import { ItemManager } from './ItemManager';

export class AttackManager {
    public static instance: AttackManager;

    constructor() {
        AttackManager.instance = this;
    }

    public async attack(cell: GridCell): Promise<void> {
        if (TurnManager.instance.isTurnFrozen()) return; // ✅ Защита
        if (!cell) return;

        VisualEffectPlayer.instance.playExplosion(cell);

        const blocked = ShieldEffectSubObject.tryIntercept(cell);
        if (blocked) {
            await TurnManager.instance.endCurrentTurn();
            return;
        }

        const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;

        if (unit && unit.isAlive) {
            ScoreManager.instance.registerHit();
            unit.markAsDead();
            UnitGroupManager.instance.onUnitDestroyed(unit);
        } else {
            ScoreManager.instance.registerMiss();
        }

        BattleController.instance.openAndRevealCell(cell);

        if (await ItemManager.instance.tryAutoTriggerItems()) return;

        await TurnManager.instance.endCurrentTurn();
    }
}
