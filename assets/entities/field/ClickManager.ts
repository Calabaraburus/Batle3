import { _decorator, Component, Node, EventTouch, Vec3, Camera, input, Input, UITransform } from 'cc';
import { HexCell } from './HexCell';
import { HexGridManager } from './HexGridManager';
import { BattleController } from './BattleController';

const { ccclass, property } = _decorator;

@ccclass('ClickManager')
export class ClickManager extends Component {
    @property({ type: Node })
    gridManagerNode: Node | null = null;

    @property({ type: Camera })
    camera: Camera | null = null;

    private gridManager: HexGridManager | null = null;

    private allCells: HexCell[] = [];

    onEnable() {
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    start() {
        this.gridManager = this.gridManagerNode?.getComponent(HexGridManager) || null;
    }

    public updateCells(cells: HexCell[]) {
        this.allCells = cells;
    }    

    private onTouchEnd(event: EventTouch) {
        if (!this.camera || !this.gridManagerNode || !this.gridManager) return;
    
        const screenPos = event.getUILocation();
        const worldPos = this.camera.screenToWorld(new Vec3(screenPos.x, screenPos.y, 0));
        console.log('[ClickManager] WorldPos:', worldPos);
    
        // Переводим позицию клика в локальные координаты поля
        const localClickPos = new Vec3();
        this.gridManagerNode.inverseTransformPoint(localClickPos, worldPos);
    
        // Проверяем попадание
        for (const hex of this.allCells) {
            console.log(`[ClickManager] Checking hex at (${hex.gridX}, ${hex.gridY})`);
            if (hex.tryHit(localClickPos)) {
                console.log(`[ClickManager] Hit on cell at (${hex.gridX}, ${hex.gridY})`);
                BattleController.instance?.onCellClicked(hex);
                return;
            }
        }
    
        console.log(`[ClickManager] Missed click at localClickPos: ${localClickPos.toString()}`);
    }
    
}
