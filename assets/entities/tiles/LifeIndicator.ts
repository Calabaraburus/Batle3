import {
    _decorator,
    __private,
    Component,
    CCInteger,
    SpriteFrame,
    Node,
    Sprite,
    UITransform,
    Size
} from "cc";

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass("LifeIndicator")
@executeInEditMode(true)
export class LifeIndicator extends Component {
    private _activeLifes: number;
    private _maxLifes: number;
    private _sprites: Sprite[] = [];
    private _singleIndicatorWidth: number = 15;
    private _singleIndicatorHeight: number = 15;


    @property(CCInteger)
    get singleIndicatorWidth() {
        return this._singleIndicatorWidth;
    }

    set singleIndicatorWidth(value: number) {
        if (this._singleIndicatorWidth != value) {
            this._singleIndicatorWidth = value;
            this.updateIndicatorSize();
        }
    }

    @property(CCInteger)
    get singleIndicatorHeight() {
        return this._singleIndicatorHeight;
    }

    set singleIndicatorHeight(value: number) {
        if (this._singleIndicatorHeight != value) {
            this._singleIndicatorHeight = value;
            this.updateIndicatorSize();
        }
    }

    @property(CCInteger)
    get maxLifes() {
        return this._maxLifes;
    }

    set maxLifes(value: number) {
        if (this._maxLifes != value) {
            this._maxLifes = value;
            this.createLifes();
        }
    }

    @property(CCInteger)
    get activeLifes() {
        return this._activeLifes;
    }

    set activeLifes(value: number) {
        if (this._activeLifes != value) {

            if (value > this._maxLifes) {
                value = this._maxLifes;
            }

            this._activeLifes = value;
            this.updateLifes();
        }
    }

    @property(SpriteFrame)
    ActiveSprite: SpriteFrame;

    @property(SpriteFrame)
    UnactiveSprite: SpriteFrame;

    start() {
        this.createLifes();
    }

    createLifes() {
        this.node.removeAllChildren();

        if (this.maxLifes <= 1) return;

        this._sprites = [];

        for (let i = 0; i < this._maxLifes; i++) {
            const element = new Node();
            const sprite = element.addComponent(Sprite);
            sprite.spriteFrame = this.ActiveSprite;
            sprite.node.layer = this.node.layer;
            this._sprites.push(sprite);

            this.node.addChild(element);
        }

        this.updateLifes();
        this.updateIndicatorSize();
    }

    updateLifes() {
        this._sprites.forEach(s => s.spriteFrame = this.UnactiveSprite);
        const cnt = this._activeLifes > this._maxLifes ? this._maxLifes : this._activeLifes;

        for (let i = 0; i < cnt; i++) {
            const sprite = this._sprites[i];

            sprite.spriteFrame = this.ActiveSprite;
        }
    }

    updateIndicatorSize() {
        this._sprites.forEach(s => {
            const transform = s.node.getComponent(UITransform);
            if (transform) {
                transform.contentSize = new Size(this._singleIndicatorWidth,
                    this._singleIndicatorHeight);
            }
        });
    }
}
