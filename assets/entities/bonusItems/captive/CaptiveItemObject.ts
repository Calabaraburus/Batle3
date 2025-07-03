import { Prefab } from 'cc';
import { GridCell } from '../../field/GridCell';
import { ItemSubObject } from '../ItemSubObject';
import { CaptiveItemVisual } from './CaptiveItemVisual';
import { VictoryChecker } from '../../../resources/levels/VictoryChecker';

/**
 * CaptiveItemObject — автотриггерный предмет-заложник.
 * Активируется после открытия клетки: проигрывает анимацию и исчезает.
 */
export class CaptiveItemObject extends ItemSubObject {
    public prefab: Prefab | null = null;

    static allCaptives: CaptiveItemObject[] = [];

    protected onInit(): void {
        this.isAutoTriggered = true;
        this.initVisual();
    }

    protected onDestroy(): void {
        this.visualNode?.destroy();
        this.visualNode = null;
    }

    public get isUsedPublic(): boolean {
        return this.isUsed;
    }

    public static resetCaptivesList(): void {
        CaptiveItemObject.allCaptives = [];
    }

    onAttachToCell(cell: GridCell): void {
        super.onAttachToCell(cell);
        if (!CaptiveItemObject.allCaptives.includes(this)) {
            CaptiveItemObject.allCaptives.push(this);
        }
    }

    public tryApplyEffectTo(target: GridCell): boolean {
        if (!this.cell || this.cell !== target || this.isUsed) return false;

        const visual = this.visualNode?.getComponent(CaptiveItemVisual);
        if (visual) {
            visual.playFreeAnimation(() => {
                this.consume();
                VictoryChecker.instance?.checkVictory();
            });
        } else {
            this.consume();
            VictoryChecker.instance?.checkVictory();
        }

        return true;
    }

    public arm(): void {
        super.arm(); // На случай, если где-то вызывается, но не требуется вручную
    }
}
