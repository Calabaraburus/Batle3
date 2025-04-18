import { _decorator, assert, Component, gfx, Node, ScrollView, UITransform, Vec2 } from 'cc';
import { LevelMapObjectsController } from './LevelMapObjectsController';
import { MapGraphics } from './MapGraphics';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('MapController')
export class MapController extends Component {
    @property(Node)
    marker: Node;

    @property(Node)
    content: Node;

    private _levelObjects = new Map<string, LevelMapObjectsController>();
    private _graphics: MapGraphics | null | undefined;
    private _scrollView: ScrollView;

    start(): void {
        this.fillLvlObjects(this.content);
        this._graphics = this.content.getChildByName('graphics')?.getComponent(MapGraphics);
        const tComp = this.getComponent(ScrollView);

        assert(tComp != null);

        this._scrollView = tComp;
    }

    setCurrent(lvlObj: LevelMapObjectsController) {
        this.marker.worldPosition = lvlObj.levelButtonNode.worldPosition.clone();
        const transform = this._scrollView.content?.getComponent(UITransform);

        if (transform) {
            this._scrollView.scrollTo(new Vec2(this.marker.position.x / transform.contentSize.x,
                this.marker.position.y / transform.contentSize.y));
        }
    }

    getLvlObject(key: string) {
        return this._levelObjects.get(key);
    }

    activateLvlObjects(key: string[], activate = true) {
        key.forEach(k => { this.activateLvlObjectByKey(k, activate) });
    }

    activateLvlObjectByKey(key: string, activate = true) {
        const lvl = this._levelObjects.get(key);
        if (lvl) {
            this.activateLvlObject(lvl, activate);
        }
    }

    activateLvlObject(lvlObj: LevelMapObjectsController, activate = true) {
        if (lvlObj.levelButtonNode) lvlObj.levelButtonNode.active = activate;
        lvlObj.editionalObjects.forEach(o => o.active = activate);
        this._graphics?.Refresh();
    }

    activateAll(activate = true) {
        this._levelObjects.forEach(lo => { this.activateLvlObject(lo, activate) });
    }

    fillLvlObjects(root: Node) {
        root.children.forEach(c => {
            if (c.name.toLowerCase().startsWith("lvl")) {
                this.addLvlObject(c);
            } else {
                this.fillLvlObjects(c);
            }
        });
    }

    addLvlObject(objNode: Node) {
        const nameParts = objNode.name.toLowerCase().split("_");
        let lvlMapObj: LevelMapObjectsController | undefined;
        const lvlName = nameParts[0];

        if (this._levelObjects.has(lvlName)) {
            lvlMapObj = this._levelObjects.get(lvlName);
        } else {
            lvlMapObj = new LevelMapObjectsController();
        }

        assert(lvlMapObj != null);

        lvlMapObj.levelName = lvlName;

        if (nameParts[1] == 'btn') {
            lvlMapObj.levelButtonNode = objNode;
        } else {
            lvlMapObj.editionalObjects.push(objNode);
        }

        this._levelObjects.set(lvlName, lvlMapObj);

    }
}
