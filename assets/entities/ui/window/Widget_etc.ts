import { _decorator, Component, Node, UITransform, view } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Widget_etc')
@executeInEditMode(true)
export class Widget_etc extends Component {
    start() {
        const viewSize = view.getVisibleSize();
        const transform = this.getComponent(UITransform);

        if (transform) {
            transform.height = viewSize.height / 2;
        }
    }
}


