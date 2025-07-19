import {
    _decorator, Component, Sprite, SpriteFrame, Node, Color,
    UITransform, Vec3, EventTouch,
    CircleCollider2D,
    PhysicsSystem2D
} from 'cc';
import { GridCell } from './GridCell';
import { GridSubObject } from '../subObjects/GridSubObject';
import { BattleController } from '../battle/BattleController';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';
import { ItemSubObject } from '../bonusItems/ItemSubObject';


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

    @property(Node)
    destroyedOverlay: Node | null = null;

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

    public handleClick(event: EventTouch) {
        const cell = this.logicalCell;
        if (!cell) return;

        // ⛔ Если тайл открыт и на нём нет предметов — игнорируем клик
        if (cell.getParameter('opened') && !cell.hasItem()) {
            return;
        }

        const point = event.getUILocation();
        const collider = this.node.getComponent(CircleCollider2D);

        if (collider && PhysicsSystem2D.instance.testPoint(point)) {
            console.log(`[HexCell] ✓ HIT on collider`);
            BattleController.instance?.onCellClicked(this);
        } else {
            console.log(`[HexCell] ✘ MISS on collider`);
        }
    }

    public showDestroyedEffect(): void {
        if (this.destroyedOverlay) {
            this.destroyedOverlay.active = true;

            const spriteFrame = this.destroyedOverlay.getComponent(Sprite);
            if (spriteFrame){
                spriteFrame.color = new Color(255, 255, 255, 150)
            }
            this.markAsBurning()
        }
    }

    public hideDestroyedEffect(): void {
        if (this.destroyedOverlay) {
            this.destroyedOverlay.active = false;
        }
    }

    public markAsBurning(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.color = new Color(255, 100, 100); // красноватый оттенок
        }
    }

    public resetColor(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.color = new Color(255, 255, 255); // вернуть исходный
        }
    }

    public highlightOnce(duration = 0.5): void {
        const sprite = this.getComponent(Sprite);
        if (!sprite) return;

        const originalColor = sprite.color.clone();
        sprite.color = new Color(255, 255, 100); // жёлтый

        this.scheduleOnce(() => {
            sprite.color = originalColor;
        }, duration);
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

    public markAsOpened(forceKill = false): void {
        this.markAsBurning();

        const fogNode = this.node.getChildByName('FogEffect');
        if (fogNode && fogNode.isValid) {
            fogNode.active = false;
        }

        const cell = this.logicalCell;
        if (!cell) return;

        if (forceKill) {
            const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;
            if (unit && unit.isAlive) {
                unit.markAsDead();
            }
        }

        cell.addParameter('opened', true);

        const items = cell.getSubObjects().filter(obj => obj instanceof ItemSubObject) as ItemSubObject[];
        for (const item of items) {
            if (!item.isReadyToArm()) {
                item.activate();
            }
        }
    }
        
    public markAsFriendly(): void {
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.color = new Color(180, 235, 180); // зелёный оттенок
        }
    }

} 
