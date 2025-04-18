import { _decorator, assert, CCInteger, Component, EditBox, instantiate, Layout, Node, Prefab, UITransform, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Grid')
export class Grid extends Component {

    @property(CCInteger)
    rowCount: number = 2;

    @property(Prefab)
    rowPrefab: Prefab;

    public rows: Node[] = []

    start() {
        this.updateGrid();
    }

    public updateGrid() {
        const rowsNode = this.node.getChildByName("rows");

        assert(rowsNode != null);

        if (this.rowCount >= rowsNode.children.length) {
            for (let ri = rowsNode.children.length; ri < this.rowCount; ri++) {
                const row = instantiate(this.rowPrefab);
                rowsNode.addChild(row);
            }

        } else {
            rowsNode.children.length = this.rowCount;
        }

        this.rows = rowsNode.children;
    }
}

