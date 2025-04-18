import {
  _decorator,
  assert,
  Button,
  CCFloat,
  CCString,
  Component,
  Enum,
  Node,
  RichText,
  Sprite,
  SpriteFrame,
} from "cc";
import { AudioManager } from "../../soundsPlayer/AudioManager";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { Service } from "../services/Service";
import { MenuSelectorController } from "./MenuSelectorController";
const { ccclass, property } = _decorator;

@ccclass("MenuOptionsItem")
export class MenuOptionsItem extends Service {
  @property(CCFloat)
  volume = 0;

  @property(Node)
  flagSprite: Node;

  volumeStates: MenuOptionsItem[] = [];

  private _audio: AudioManagerService | null;
  private _menuController: MenuSelectorController | null;

  start(): void {
    // this._flag = false;
    // this.node.on(Node.EventType.MOUSE_DOWN, this.changeVolumeFlag, this);
    // if (this._flag == false) {
    //   this.getCurrentVolumeFlag();
    // }
    // this._flag = false;
    this.getCurrentVolume();

    if (!this.volumeStates) return;
    const stateNodes = this.node.parent?.children;
    stateNodes?.forEach((elem) => {
      const itemMenu = elem.getComponent(MenuOptionsItem);
      if (!itemMenu) return;
      this.volumeStates.push(itemMenu);
    });

    this._audio = this.getService(AudioManagerService);
    assert(this._audio != null, "Can't find AudioManagerService");

    // const button = this.node.getComponent(Button);
    // assert(button, "Can't get Button component");

    this.node.on(Node.EventType.MOUSE_DOWN, this.setupVolume, this);

    // button.node.on(Button.EventType.CLICK, this.clickCallback, this);
  }

  getCurrentVolume() {
    if (this.node.parent?.name == "Music") {
      if (this.volume == AudioManager.instance.volumeMusic) {
        this.flagSprite.active = true;
      }
    }
    if (this.node.parent?.name == "Sound") {
      if (this.volume == AudioManager.instance.volumeSound) {
        this.flagSprite.active = true;
      }
    }
  }

  setupVolume() {
    this.activeNodes();
    if (this.node.parent?.name == "Music") {
      this._audio?.changeMusicVolume(this.volume);
    } else if (this.node.parent?.name == "Sound") {
      this._audio?.changeSoundVolume(this.volume);
    }
    this._audio?.playSoundEffect("click");
    // let currentVolume;
    // const parentCurrentNode = this.node.parent;
    // if (!parentCurrentNode) return;
    // if (parentCurrentNode.name == "Music") {
    //   currentVolume = AudioManager.instance._volumeMusic;
    // } else if (parentCurrentNode.name == "Sound") {
    //   currentVolume = AudioManager.instance._volumeSound;
    // }
    // if (this.node.name == "Off" && currentVolume == 0) {
    //   this.searchVolumeFlag();
    // } else if (this.node.name == "Low" && currentVolume == 0.2) {
    //   this.searchVolumeFlag();
    // } else if (this.node.name == "Middle" && currentVolume == 0.4) {
    //   this.searchVolumeFlag();
    // } else if (this.node.name == "Hight" && currentVolume == 1) {
    //   this.searchVolumeFlag();
    // }
  }

  // searchVolumeFlag() {
  //   const elem = this.node.getChildByPath("buttonPriceZone/volumeActive");

  //   this.resetActiveNodes();

  //   if (!elem) return;
  //   elem.active = true;
  // }

  // changeVolumeFlag() {
  //   const elem = this.node.getChildByPath("buttonPriceZone/volumeActive");

  //   this.resetActiveNodes();

  //   if (!elem) return;
  //   elem.active = true;

  //   this._flag = true;
  // }

  activeNodes() {
    this.volumeStates?.forEach((elem) => {
      if (elem != this) {
        elem.flagSprite.active = false;
      } else {
        this.flagSprite.active = true;
      }
    });
  }

  clickCallback(event: Event, customEventData: string) {
    this._audio?.playSoundEffect("click");
  }
}
