import {
  _decorator,
  Sprite,
  Label,
  Button,
  tween,
  Vec3,
  Node,
  UITransform,
  assert,
  SpriteFrame,
  UIOpacity,
  CCFloat,
} from "cc";
import { BonusModel } from "../../../models/BonusModel";
import { LevelModel } from "../../../models/LevelModel";
import { Service } from "../../services/Service";
import { CardFieldController } from "./CardFieldController";
import { WindowManager } from "../../infoPanel/WindowManager";
import { AudioManagerService } from "../../../soundsPlayer/AudioManagerService";
import { SpriteDictionaryItem } from "./SpriteDictionaryItem";
const { ccclass, property } = _decorator;

@ccclass("CardController")
export class CardController extends Service {
  private _model: BonusModel;
  private _cardField: CardFieldController | null | undefined;
  private _button: Button | null;
  private _fromPos: Vec3;
  private _toPos: Vec3;
  private _fromScale: Vec3;
  private _toScale: Vec3;
  private _animMultiplier = 1.12;
  private _animSift = 15;
  private _selected: boolean;
  private _maskPos: Vec3 = new Vec3();
  private _spritePos: Vec3 = new Vec3();
  private _maskHeight = 200;
  private _levelModel: LevelModel | null;
  private _manager: WindowManager | null;
  private _soulOpcity: UIOpacity | null;

  @property(Sprite)
  sprite: Sprite;

  @property(Sprite)
  unactiveSprite: Sprite;

  @property(Node)
  maskNode: Node;

  @property(Label)
  lblPrice: Label;

  @property(Label)
  lblCardAmount: Label;

  @property(Node)
  fillLineNode: Node;

  @property(SpriteFrame)
  lvlSprites: SpriteFrame[] = [];

  @property(SpriteDictionaryItem)
  tileTypeSprites: SpriteDictionaryItem[] = [];

  @property(Sprite)
  crystalSprite: Sprite;

  @property(Sprite)
  tileTypeSprite: Sprite;


  @property(Node)
  soulEffectNode: Node;

  @property(CCFloat)
  soulEffectSpeedCoef = 1;

  get model(): BonusModel {
    return this._model;
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    if (this._selected != value) {
      if (this._model.selected != value) {
        this._model.selected = value;
      }

      this._selected = value;

      this.animateSelect();
    }
  }

  setModel(model: BonusModel) {
    this._model = model;
    this.updateData();
  }

  start() {
    this._levelModel = this.getService(LevelModel);
    this._manager = this.getService(WindowManager);

    this._soulOpcity = this.soulEffectNode.getComponent(UIOpacity);

    this._fromScale = this.node.scale.clone();
    this._toScale = new Vec3(
      this._fromScale.x * this._animMultiplier,
      this._fromScale.y * this._animMultiplier,
      this._fromScale.z
    );

    this._fromPos = this.node.position.clone();

    this._toPos = new Vec3(
      this._fromPos.x,
      this._fromPos.y + this._animSift,
      this._fromPos.z
    );

    this._maskPos = this.sprite.node.position;
    this._maskHeight = this.sprite.getComponent(UITransform)?.height ?? -1;

    if (this._maskHeight < 0) {
      Error("Can't get UITransform component for sprite");
    }

    this._spritePos = this.maskNode.position;

    this._button?.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this._button?.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

    this.updateData();
  }

  protected update(dt: number): void {
    if (this._soulOpcity && this._soulOpcity.opacity > 0) {
      this._soulOpcity.opacity -= this.soulEffectSpeedCoef;
    }
  }

  public PlaySoulEffect() {
    if (this._soulOpcity) this._soulOpcity.opacity = 255;
  }

  onTouchStart() {
    this.scheduleOnce(this.scheduleOpenWindow, 0.5);
  }

  onTouchEnd() {
    this.unschedule(this.scheduleOpenWindow);

    if (!this._manager?.cardWindowIsOpened() && this._button?.interactable) {
      this.selected = !this.selected;
      this.node.emit("cardClicked", this, this.selected);
    }
  }

  scheduleOpenWindow() {
    this._manager?.showCardWindow(this.model);
  }

  updateData() {
    if (this._button == null) {
      this._button = this.getComponent(Button);
    }

    if (this._button == null) {
      return;
    }

    this.updateLevelSprite();
    this.updateTileTypeSprite();

    this._button.interactable =
      this._model.active && !this.model.alreadyUsedOnTurn;

    this.sprite.spriteFrame = this._model.sprite;
    this.unactiveSprite.spriteFrame = this._model.sprite;
    this.lblCardAmount.string = Math.floor(this._model.currentAmmountToActivate / this._model.priceToActivate).toString();
    this.selected = this.model.selected;

    if (this._levelModel?.gameMechanicType == 1) {
      this.sprite.node.active = true;
      this.moveMask();
      this.moveLine();
    } else {
      this.sprite.node.active = this._button.interactable;
    }
  }

  updateTileTypeSprite() {
    this.tileTypeSprite.spriteFrame = this.tileTypeSprites.find(f => f.key == this._model.activateType)?.sprite ?? null;
  }


  updateLevelSprite() {
    switch (this._model.bonusLevel) {
      case 0:
        this.crystalSprite.spriteFrame = null;
        break;
      case 1:
        this.crystalSprite.spriteFrame = this.lvlSprites[0];
        break;
      case 2:
        this.crystalSprite.spriteFrame = this.lvlSprites[1];
        break;
    }
  }

  calcPos(negative = false) {
    let coef =
      1 - this.model.currentAmmountToActivate / this.model.priceToActivate;

    coef = coef < 0 ? 0 : coef;

    if (this.model.alreadyUsedOnTurn && coef == 0) {
      coef = 1;
    }

    return new Vec3(0, (negative ? -1 : 1) * this._maskHeight * coef, 0);

  }

  moveLine() {
    const tpos = this.calcPos(true);
    tpos.y += this._maskHeight / 2;
    this.fillLineNode.position = tpos;
  }

  moveMask() {

    let tpos = this.calcPos(true);

    this.maskNode.setPosition(tpos);

    tpos = this.calcPos();

    this.sprite.node.setPosition(tpos);
  }

  animateSelect() {
    tween(this.node)
      .to(
        0.1,
        {
          position: this.selected ? this._toPos : this._fromPos,
          scale: this.selected ? this._toScale : this._fromScale,
        },
        { easing: "sineIn" }
      )
      .start();
  }
}