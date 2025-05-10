import { _decorator, Component, Prefab } from 'cc';
import { HexGridManager } from './HexGridManager';
import { FranceUnitObject } from './FranceUnitObject';
import { BombItemObject } from './BombItemObject';
import { FogSubObject } from './FogSubObject';
import type { GridCell } from './GridCell';
import { UnitSubObject } from './UnitSubObject';
import { ItemSubObject } from './ItemSubObject';

const { ccclass, property } = _decorator;

@ccclass('SubObjectGenerator')
export class SubObjectGenerator extends Component {
    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    @property({ type: Prefab })
    francePrefab: Prefab | null = null;

    @property({ type: Prefab })
    bombPrefab: Prefab | null = null;

    @property({ type: Prefab })
    fogPrefab: Prefab | null = null;

    @property
    playerUnits = 3;

    @property
    enemyUnits = 3;

    @property
    playerItems = 2;

    @property
    enemyItems = 2;

    start() {
        if (!this.gridManager) return;

        const playerCells = this.gridManager.getPlayerCells();
        const enemyCells = this.gridManager.getEnemyCells();

        // Универсальные вызовы
        this.spawnCustomUnits(playerCells, this.playerUnits, this.francePrefab, FranceUnitObject);
        this.spawnCustomUnits(enemyCells, this.enemyUnits, this.francePrefab, FranceUnitObject); // заменишь на другой тип

        this.spawnCustomItems(playerCells, this.playerItems, this.bombPrefab, BombItemObject);
        this.spawnCustomItems(enemyCells, this.enemyItems, this.bombPrefab, BombItemObject);

        this.spawnFog(enemyCells, this.fogPrefab);
    }

    private spawnCustomUnits<T extends UnitSubObject & { prefab: Prefab | null }>(
        cells: GridCell[],
        count: number,
        prefab: Prefab | null,
        UnitType: new () => T
    ): void {
        if (!prefab) return;

        const available = [...cells].filter(cell => !cell.hasAnyMainSubObject());

        for (let i = 0; i < count && available.length > 0; i++) {
            const index = Math.floor(Math.random() * available.length);
            const cell = available.splice(index, 1)[0];

            const unit = new UnitType();
            unit.prefab = prefab;
            cell.attachSubObject(unit);
        }
    }

    private spawnCustomItems<T extends ItemSubObject & { prefab: Prefab | null }>(
        cells: GridCell[],
        count: number,
        prefab: Prefab | null,
        ItemType: new () => T
    ): void {
        if (!prefab) return;

        const available = [...cells].filter(cell => !cell.hasAnyMainSubObject());

        for (let i = 0; i < count && available.length > 0; i++) {
            const index = Math.floor(Math.random() * available.length);
            const cell = available.splice(index, 1)[0];

            const item = new ItemType();
            item.prefab = prefab;
            cell.attachSubObject(item);
        }
    }

    private spawnFog(cells: GridCell[], prefab: Prefab | null): void {
        if (!prefab) return;

        for (const cell of cells) {
            const fog = new FogSubObject();
            fog.fogPrefab = prefab;
            cell.attachSubObject(fog);
        }
    }
}
