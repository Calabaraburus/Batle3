import {
  _decorator,
  Component,
  Node,
  Graphics,
  RenderRoot2D,
  randomRangeInt,
  Color,
  CCFloat,
  Vec2,
  Vec4,
  tween,
  Vec3,
  director,
} from "cc";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { Service } from "../services/Service";
import { EffectsService } from "../services/EffectsService";
import { Line } from "./Line";
import { StaticEffect } from "./StaticEffect";
const { ccclass, property } = _decorator;

class AnimTarget {
  proc = 1;
}

@ccclass("ShootEffect")
export class ShootEffect extends StaticEffect {
  @property({ type: Color })
  color: Color;

  @property({ type: CCFloat })
  width: number;

  public makeShoots(shootLines: Line[]) {
    const procObj = new AnimTarget();
    const animator = tween(procObj);

    animator
      .to(
        2,
        { proc: 0 },
        {
          easing: "backOut",
          onUpdate: (tar) => {
            const target = tar as AnimTarget;
            if (target == null) return;

            this.graphics.clear();
            const color = this.color.clone();
            color.a = 255 * target.proc;
            this.drawLines(shootLines, color, this.width);
          },
        }
      )
      .start();
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.graphics.moveTo(x1, y1); // Set the starting point of the path
    this.graphics.lineTo(x2, y2); // end
    this.graphics.stroke(); // fill path
  }

  drawLines(lines: Line[], color: Color, width: number) {
    this.graphics.strokeColor = color;
    this.graphics.lineWidth = width;
    lines.forEach((l) => {
      this.drawLine(l.startPoint.x, l.startPoint.y, l.endPoint.x, l.endPoint.y);
    });
  }
}
