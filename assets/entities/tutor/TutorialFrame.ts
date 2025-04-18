import { _decorator, assert, Component, Node, UITransform, Vec3, view } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TutorialFrame')
@executeInEditMode(true)
export class TutorialFrame extends Component {

    @property(Node)
    front: Node;

    @property(Node)
    back: Node;

    start(): void {
        const frontTransform = this.front.getComponent(UITransform);
        const backTransform = this.back.getComponent(UITransform);
        const thisTransform = this.node.getComponent(UITransform);

        assert(frontTransform != null);
        assert(backTransform != null);
        assert(thisTransform != null);

        const onPositionChanged = () => {
            this.back.setWorldPosition(new Vec3(0, 0, 0));
        }

        const onSizeChanged = () => {
            frontTransform.contentSize = thisTransform.contentSize;
            //this.back.setWorldPosition(new Vec3(0, 0, 0));
            backTransform.contentSize = view.getVisibleSize();
            backTransform.node.worldScale = new Vec3(1, 1, 1);
        }

        onPositionChanged();
        onSizeChanged();

        this.node.on(Node.EventType.SIZE_CHANGED, () => {
            onSizeChanged();
        });

        this.node.on(Node.EventType.TRANSFORM_CHANGED, (type: number) => {
            if (type & Node.TransformBit.POSITION) {
                onPositionChanged();
            }
        }, this);
    }


}