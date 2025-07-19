import { _decorator, assert, Component, Node, UITransform, Vec3, view } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TutorialFrame')
@executeInEditMode(true)
export class TutorialFrame extends Component {

    @property(Node)
    front: Node = null!; // Mask-дырка

    @property(Node)
    back: Node = null!; // затемнение (Sprite с BlockInputEvents)

    start(): void {
        const frontTransform = this.front.getComponent(UITransform);
        const backTransform = this.back.getComponent(UITransform);
        const thisTransform = this.node.getComponent(UITransform);

        assert(frontTransform != null);
        assert(backTransform != null);
        assert(thisTransform != null);

        const onPositionChanged = () => {
            this.back.setWorldPosition(new Vec3(0, 0, 0)); // фон всегда в центре
        }

        const onSizeChanged = () => {
            frontTransform.contentSize = thisTransform.contentSize;
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

    public setTargetTile(tileNode: Node): void {
        const tileTransform = tileNode.getComponent(UITransform);
        const frameTransform = this.node.getComponent(UITransform);

        if (!tileTransform || !frameTransform) {
            console.warn('[TutorialFrame] Missing UITransform!');
            return;
        }

        // Устанавливаем такой же размер, как у тайла
        frameTransform.contentSize = tileTransform.contentSize;

        // Переводим мировую позицию тайла в позицию TutorFrame
        const worldPos = tileNode.getWorldPosition();
        const localPos = this.node.parent?.getComponent(UITransform)?.convertToNodeSpaceAR(worldPos);

        if (localPos) {
            this.node.setPosition(localPos);
        }
    }

}
