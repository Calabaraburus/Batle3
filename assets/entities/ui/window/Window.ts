import { _decorator, assert, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { Service } from '../../services/Service';
const { ccclass, property } = _decorator;

@ccclass('Window')
export class Window extends Service {

    private _origPos: Vec3;
    private _groups: Node[] = [];
    private _uiOpacity: UIOpacity;
    private _tweenObj: targetWndTweenObj;
    private _speed = 0.3;
    private _isOpened = false;
    private _wasInit = false;

    public get isOpened() {
        return this._isOpened;
    }

    private set origPos(value: Vec3) {
        this._origPos = value;
    }

    private get origPos() {
        return this._origPos;
    }

    public get uiOpacity() {
        return this._uiOpacity;
    }

    start() {
        const tComponent = this.getComponent(UIOpacity);

        assert(tComponent != null, "can't find UIOpacity");

        this._uiOpacity = tComponent;

        this._uiOpacity.opacity = 0;

        this.origPos = this.node.position.clone();
        this.fillGroupArr();

        this._tweenObj = new targetWndTweenObj(this);

        this._wasInit = true;
    }

    private fillGroupArr() {
        const content = this.node.children.find(n => n.name == "content");

        if (content) {
            this._groups = [];
            content.children.forEach(n => {
                if (n.name.toLowerCase().endsWith('group')) {
                    this._groups.push(n);
                }
            });
        }
    }

    public showWindow() {

        if (!this._wasInit) this.start();

        this.node.active = true;
        this._isOpened = true;

        tween(this._tweenObj)
            .to(this._speed, { position: new Vec3(0, 0, 0), opacity: 255 }, { easing: "cubicIn" })
            .start();
    }

    public hideWindow() {
        this._isOpened = false;

        tween(this._tweenObj)
            .to(this._speed, { position: this.origPos, opacity: 0 }, { easing: "cubicOut" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    public showContentGroup(groupName: string) {

        this._groups.forEach(g => {
            g.active = g.name.toLowerCase() == groupName.toLowerCase() + "group" ? true : false;
        });

    }

    public showContentGroupExternal(ev: any, groupName: string) {

        this.showContentGroup(groupName);

    }
}

class targetWndTweenObj {

    private _wnd: Window;

    public set position(value: Vec3) {
        this._wnd.node.position = value;
    }

    public get position() {
        return this._wnd.node.position;
    }


    public set opacity(value: number) {
        this._wnd.uiOpacity.opacity = value;
    }

    public get opacity() {
        return this._wnd.uiOpacity.opacity;
    }

    constructor(window: Window) {
        this._wnd = window;
    }
}
