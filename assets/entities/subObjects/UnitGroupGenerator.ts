import { _decorator, Component, Prefab, instantiate } from 'cc';
import { HexGridManager } from '../field/HexGridManager';
import { PlacementPlanner } from './PlacementPlanner';
import { GridCell } from '../field/GridCell';
import { UnitGroupManager } from '../battle/UnitGroupManager';
import { UnitSubObject } from './units/UnitSubObject';
import { CatUnitObject } from './units/cat/CatUnitObject';
import { OrcUnitObject } from './units/orcs/OrcUnitObject';

const { ccclass, property } = _decorator;

export interface UnitDefinition<T extends UnitSubObject = UnitSubObject> {
    id: string;
    prefab: Prefab | null;
    type: new () => UnitSubObject;
    owner: 'player' | 'enemy';
}

@ccclass('UnitGroupGenerator')
export class UnitGroupGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: [Number] })
    playerGroupSizes: number[] = [];

    @property({ type: [Number] })
    enemyGroupSizes: number[] = [];

    @property({ type: Prefab })
    catUnitPrefab: Prefab | null = null;

    @property({ type: Prefab })
    orcUnitPrefab: Prefab | null = null;

    private unitRegistry: UnitDefinition[] = [];

    // start() {
    //     this.registerUnits();
    // }

    public registerUnits(): void {
        this.unitRegistry = [
            { id: 'cat', prefab: this.catUnitPrefab, type: CatUnitObject, owner: 'player' },
            { id: 'orc', prefab: this.orcUnitPrefab, type: OrcUnitObject, owner: 'enemy' },
        ];
    }

    public generateGroups(owner: 'player' | 'enemy'): void {
        if (!this.gridManager) return;

        const cells = owner === 'player'
            ? this.gridManager.getPlayerCells()
            : this.gridManager.getEnemyCells();

        const groupSizes = owner === 'player'
            ? this.playerGroupSizes
            : this.enemyGroupSizes;

        const plans = PlacementPlanner.planGroups(cells, groupSizes, owner);

        for (const plan of plans) {
            UnitGroupManager.instance.createGroup(plan.groupId, owner);

            for (const cell of plan.cells) {
                const { unit } = this.createUnitForOwner(owner);
                cell.attachSubObject(unit);
                UnitGroupManager.instance.registerUnitToGroup(plan.groupId, unit, cell);
                
                // Скрыть визуал юнита врага, если клетка закрыта
                if (owner === 'enemy' && cell.getParameter('opened') !== true) {
                    unit.setHidden(true);
                }
            }
        }
    }

    private createUnitForOwner(owner: 'player' | 'enemy'): { unit: UnitSubObject, def: UnitDefinition } {
        const candidates = this.unitRegistry.filter(def => def.owner === owner);
        const def = candidates[Math.floor(Math.random() * candidates.length)];

        // const node = instantiate(def.prefab);
        const unit = new def.type();

        if (!unit) {
            throw new Error(`Prefab "${def.id}" does not have component of type ${def.type.name}`);
        }

        unit.prefab = def.prefab;
        unit.unitId = def.id;

        return { unit, def };
    }
}
