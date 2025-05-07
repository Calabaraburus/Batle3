import { _decorator, Component, Color } from 'cc';
import { UnitObject } from '../UnitObject';
//import { Tile } from './Tile'; // структура вашей ячейки
//import { TileObject } from './TileObject';

const { ccclass, property } = _decorator;

@ccclass('BomberObject')
export class BomberObject extends UnitObject {
    @property({ visible: true }) alive = true;
    @property({ visible: true }) active = true;

    onActivate(): void {
        if (!this.active || !this.alive) return;

        // Ожидаем, что система позволит выбрать цель
        this.requestTargetSelection();
    }

    private requestTargetSelection() {
        // Тут ты должен связать логику с глобальной системой (TargetingSystem)
        // Примерно:
        // TargetingSystem.setMode('enemy-tile-select', this.onTargetConfirmed.bind(this));
    }

    public onTargetConfirmed(targetTile: Tile) {
        if (!this.alive || !this.active) return;
        if (!this.isEnemyTile(targetTile)) return;

        const tilesToOpen = [targetTile, ...targetTile.getAdjacentTiles()].slice(0, 3); // максимум 3 тайла

        for (const tile of tilesToOpen) {
            tile.open(); // твоя реализация открытия
            if (tile.occupant) {
                tile.occupant.markAsDestroyed(); // см. ниже
            }
        }

        this.active = false; // может использовать бонус один раз
    }

    private isEnemyTile(tile: Tile): boolean {
        if (!tile.occupant) return false;
        return tile.occupant.owner !== this.owner;
    }

    public markAsDestroyed() {
        this.alive = false;
        this.node.setColor(new Color(80, 80, 80)); // визуально как "мертвый"
        // Можно удалить/скрыть/деактивировать логику
    }
}
