import {
  _decorator,
  assert,
  Button,
  CCString,
  Component,
  Enum,
  Node,
  RichText,
  Sprite,
  SpriteFrame,
} from "cc";
import { Service } from "../services/Service";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
const { ccclass, property } = _decorator;

enum buttonBgTypes {
  default = 0,
  another = 1,
}

Enum(buttonBgTypes);

@ccclass("MenuItem")
export class MenuItem extends Service {
  @property({ type: buttonBgTypes }) menuItemType: buttonBgTypes = 0;
  @property(SpriteFrame) bgSprite: SpriteFrame;
  @property(Sprite) iconSprite: Sprite;
  @property(RichText) itemName: RichText;
  @property(CCString) titel = "item name";
  private _audio: AudioManagerService | null;

  start() {
    this.init();

    this._audio = this.getService(AudioManagerService);

    assert(this._audio != null, "Can't find AudioManagerService");

    const button = this.node.getComponent(Button);

    assert(button != null, "Can't get Button component");

    button.node.on(Button.EventType.CLICK, this.clickCallback, this);
  }

  init() {
    this.initTitle();
  }

  initTitle() {
    this.itemName.string = this.titel.toUpperCase();
  }

  clickCallback(event: Event, customEventData: string) {
    this._audio?.playSoundEffect("click");
  }
}
