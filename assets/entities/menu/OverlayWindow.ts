import { Sprite, UIOpacity, Vec3, _decorator, find, tween, Node } from "cc";
import { MainMenu } from "./MainMenu";
import { Window } from "../ui/window/Window";
import { Service } from "../services/Service";

const { ccclass, property } = _decorator;

@ccclass("OverlayWindow")
export class OverlayWindow extends Service {

  @property(Node)
  overlay: Node | null = null;

  @property(Window)
  window: Window | null = null;

  wasActivatedBefore = false;

  showWindow() {
    if (!this.overlay) return;
    if (!this.window) return;

    if (this.overlay.active) {
      this.wasActivatedBefore = true;
    } else {
      this.wasActivatedBefore = false;
      this.overlay.active = true;

      tween(this.overlay.getComponent(UIOpacity))
        .to(0.2, { opacity: 200 }, { easing: "linear" })
        .start();
    }

    this.window.showWindow();
  }

  hideWindow() {
    if (!this.overlay) return;
    if (!this.window) return;

    this.window.hideWindow();

    if (!this.wasActivatedBefore) {
      tween(this.overlay.getComponent(UIOpacity))
        .to(0.4, { opacity: 0 }, { easing: "linear" })
        .call(() => {
          if (this.overlay) {
            this.overlay.active = false;
          }
        })
        .start();
    }
  }

  closeButton() {
    return;
  }
}
