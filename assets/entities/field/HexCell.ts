import {
    _decorator, Component, Sprite, SpriteFrame, Node,
    UITransform, Vec3, EventTouch,
    CircleCollider2D,
    PhysicsSystem2D
} from 'cc';
import { GridSubObject } from './GridSubObject';
import { GridCell } from './GridCell';
import { BattleController } from './BattleController';
import { UnitSubObject } from './UnitSubObject';
import { UnitGroupManager } from './UnitGroupManager';

const { ccclass, property } = _decorator;

@ccclass('HexCell')
export class HexCell extends Component {
    x = 0;
    y = 0;
    gridX = 0;
    gridY = 0;
    cellType = 0;

    neighbors: HexCell[] = [];
    parameters: Map<string, any> = new Map();
    private logicalCell: GridCell | null = null;
    private subObjects: GridSubObject[] = [];

    @property({ type: [SpriteFrame] })
    stateSprites: SpriteFrame[] = [];

    start() {
        this.node.setSiblingIndex(999);
        this.node.on(Node.EventType.TOUCH_END, this.handleClick, this);
    }

    setParam(key: string, value: any) {
        this.parameters.set(key, value);
    }

    getParam<T>(key: string): T | undefined {
        return this.parameters.get(key);
    }

    removeParam(key: string) {
        this.parameters.delete(key);
    }

    setLogicalCell(cell: GridCell) {
        this.logicalCell = cell;
    }

    getLogicalCell(): GridCell | null {
        return this.logicalCell;
    }

    addNeighbor(cell: HexCell) {
        if (!this.neighbors.includes(cell)) {
            this.neighbors.push(cell);
        }
    }

    addSubObject(sub: GridSubObject) {
        this.subObjects.push(sub);
        if (this.logicalCell) {
            sub.onAttach(this.logicalCell);
        }
    }

    removeSubObject(sub: GridSubObject) {
        const index = this.subObjects.indexOf(sub);
        if (index !== -1) {
            this.subObjects.splice(index, 1);
            sub.onDetach();
        }
    }

    getSubObjects(): GridSubObject[] {
        return this.subObjects;
    }

    // public handleClick(event: EventTouch) {
    //     const uiTransform = this.node.parent?.getComponent(UITransform);
    //     if (!uiTransform) return;

    //     const screenPos = event.getUILocation();
    //     const localClick = uiTransform.convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));

    //     if (this.checkHit(localClick)) {
    //         console.log(`[HexCell] ✓ HIT self at (${this.gridX}, ${this.gridY})`);
    //         BattleController.instance?.onCellClicked(this);
    //         return;
    //     }

    //     for (const neighbor of this.neighbors) {
    //         if (neighbor.checkHit(localClick)) {
    //             console.log(`[HexCell] ✓ REDIRECT to neighbor at (${neighbor.gridX}, ${neighbor.gridY})`);
    //             BattleController.instance?.onCellClicked(neighbor);
    //             return;
    //         }
    //     }

    //     console.log(`[HexCell] ✘ MISS on self and neighbors → localClick: (${localClick.x.toFixed(1)}, ${localClick.y.toFixed(1)})`);
    // }

    public handleClick(event: EventTouch) {
        const point = event.getUILocation();
        const collider = this.node.getComponent(CircleCollider2D);

        if (collider && PhysicsSystem2D.instance.testPoint(point)) {
            console.log(`[HexCell] ✓ HIT on collider`);
            BattleController.instance?.onCellClicked(this);
        } else {
            console.log(`[HexCell] ✘ MISS on collider`);
        }
    }


    private checkHit(clickPos: Vec3): boolean {
        const localPos = this.node.position;
        const width = 100;  // реальный размер тайла по X
        const height = 86.6; // реальный размер тайла по Y

        const minX = localPos.x - width / 2;
        const maxX = localPos.x + width / 2;
        const minY = localPos.y - height / 2;
        const maxY = localPos.y + height / 2;

        return (
            clickPos.x >= minX && clickPos.x <= maxX &&
            clickPos.y >= minY && clickPos.y <= maxY
        );
    }

    public forceHandleClick() {
        BattleController.instance?.onCellClicked(this);
    }

    public setVisualState(state: number) {
        const sprite = this.getComponent(Sprite);
        if (sprite && this.stateSprites[state]) {
            sprite.spriteFrame = this.stateSprites[state];
        }
    }

    public disableInput() {
        this.node.off(Node.EventType.TOUCH_END, this.handleClick, this);
    }

    public markAsOpened(suppressGroupCheck = false): void {
        this.setVisualState(1);
        this.disableInput();

        const fogNode = this.node.getChildByName('FogEffect');
        if (fogNode && fogNode.isValid) {
            fogNode.active = false;
        }

        const cell = this.logicalCell;
        if (!cell) return;

        const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;

        if (unit && unit.isAlive) {
            unit.markAsDead(); // ⬅️ вызовем здесь — и только здесь

            // ❌ убери этот блок:
            // if (!suppressGroupCheck) {
            //     UnitGroupManager.instance.onUnitDestroyed(unit);
            // }
        }

        cell.addParameter('opened', true);
    }

} 
