import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, EventTarget } from 'cc';
import { ComboRow } from './ComboRow';
const { ccclass, property } = _decorator;

@ccclass('Combobox')
export class Combobox extends Component {

    public selectedEvent: EventTarget = new EventTarget();

    @property(Prefab)
    rowPrefab: Prefab;

    @property(Node)
    listNode: Node;

    @property(Node)
    rowlistNode: Node;

    @property(ComboRow)
    selectedRow: ComboRow;

    rows: ComboRow[] = [];

    protected start(): void {
        this.listNode.active = false;
    }

    add(ico: SpriteFrame, txt: string, id: string) {
        const row = instantiate(this.rowPrefab).getComponent(ComboRow);

        if (row) {
            row.node.parent = this.rowlistNode;
            row.ico = ico;
            row.txt = txt;
            row.id = id;
            this.rows.push(row);
            row.clickedEvent.on("ComboRow", this.rowClicked, this);
        }
    }

    private rowClicked(tile: ComboRow): void {
        this.select(tile.id);
        this.listNode.active = false;
    }

    select(id: string) {
        for (const row of this.rows) {
            if (row.id == id) {
                this.selectedRow.txt = row.txt;
                this.selectedRow.ico = row.ico;
                this.selectedRow.id = row.id;
                this.selectedEvent.emit("Combobox", this, this.selectedRow);
                return;
            }
        }
    }

    openList() {
        this.listNode.active = !this.listNode.active;
    }
}


