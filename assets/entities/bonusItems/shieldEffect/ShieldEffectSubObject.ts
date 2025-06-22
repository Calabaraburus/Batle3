import { _decorator, instantiate, Prefab, Node } from 'cc';
import { ShieldEffectVisual } from './ShieldEffectVisual';
import { HexCell } from '../../field/HexCell';
import { GridCell } from '../../field/GridCell';
import { EffectSubObject } from '../../subObjects/EffectSubObject';

const { ccclass } = _decorator;

@ccclass('ShieldEffectSubObject')
export class ShieldEffectSubObject extends EffectSubObject {
    // public static prefab: Prefab | null = null;
    private static nextGroupId = 1;
    private static groups: Map<number, ShieldEffectSubObject[]> = new Map();

    private groupId: number;
    private visualNode: Node | null = null;

    constructor(groupId: number) {
        super();
        this.groupId = groupId;

        if (!ShieldEffectSubObject.groups.has(groupId)) {
            ShieldEffectSubObject.groups.set(groupId, []);
        }
        ShieldEffectSubObject.groups.get(groupId)!.push(this);
    }

    protected onInit(): void {
        const cell = this.cell;
        const prefab = this.visualPrefab;
        if (!cell || !prefab) return;

        const tileNode = cell.getVisualNode();
        if (!tileNode) return;

        const node = instantiate(prefab);
        node.name = 'ShieldEffectVisual';
        tileNode.addChild(node);

        // ⚙️ Переместим щит выше фона, но под туман
        const fogIndex = tileNode.children.findIndex(child => child.name === 'FogEffect');
        if (fogIndex !== -1) {
            node.setSiblingIndex(fogIndex);
        } else {
            node.setSiblingIndex(tileNode.children.length - 1);
        }

        this.visualNode = node;
        this.setVisualNode(node);
        this.scaleToCell(); // масштабируем под тайл
        this.onApply();
    }

    public onApply(): void {
        const cell = this.cell;
        if (!cell) return;

        cell.getVisualNode()?.getComponent(HexCell)?.markAsFriendly();
        this.visualNode?.getComponent(ShieldEffectVisual)?.applyEffect();
    }

    public onRemove(): void {
        const cell = this.cell;
        if (!cell) return;

        cell.getVisualNode()?.getComponent(HexCell)?.resetColor();
        this.visualNode?.getComponent(ShieldEffectVisual)?.removeEffect();

        // this.visualNode?.destroy();
        this.visualNode?.getComponent(ShieldEffectVisual)?.fadeOutAndDestroy();
        this.visualNode = null;
    }

    public static createGroupId(): number {
        return ShieldEffectSubObject.nextGroupId++;
    }

    public static tryIntercept(cell: GridCell): boolean {
        const shields = cell.getSubObjects().filter(
            (s): s is ShieldEffectSubObject => s instanceof ShieldEffectSubObject
        );

        for (const shield of shields) {
            if (shield.groupId >= 0) {
                ShieldEffectSubObject.breakGroup(shield.groupId);
                return true;
            }
        }

        return false;
    }

    public static breakGroup(groupId: number) {
        const members = ShieldEffectSubObject.groups.get(groupId);
        if (!members) return;

        for (const shield of members) {
            shield.consume(); // вызывает onRemove + detach
        }

        ShieldEffectSubObject.groups.delete(groupId);
    }

    public onDetach(): void {
        this.onRemove();
        this.removeFromGroup();
    }

    public onDestroy(): void {
        this.onRemove();
        this.removeFromGroup();
    }

    private removeFromGroup(): void {
        const group = ShieldEffectSubObject.groups.get(this.groupId);
        if (group) {
            const filtered = group.filter(obj => obj !== this);
            if (filtered.length > 0) {
                ShieldEffectSubObject.groups.set(this.groupId, filtered);
            } else {
                ShieldEffectSubObject.groups.delete(this.groupId);
            }
        }
    }
}
