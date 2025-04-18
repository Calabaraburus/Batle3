import { _decorator, assert, Component, gfx, Graphics, Node } from 'cc';
import { MapGraphicsObject } from './MapGraphicsObject';
const { ccclass, property, executeInEditMode } = _decorator;


@ccclass('MapGraphics')
@executeInEditMode(true)
export class MapGraphics extends Graphics {

    private _refresh = true;

    objects: MapGraphicsObject[] = [];

    addObject(obj: MapGraphicsObject) {
        this.objects.push(obj);
    }

    removeObject(obj: MapGraphicsObject) {
        const index = this.objects.indexOf(obj, 0);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    Refresh() {
        this._refresh = true;
    }

    update(dt: number): void {
        if (this._refresh) {
            this.clear();
            this.objects.forEach(o => o.draw());
        }
    }
}
