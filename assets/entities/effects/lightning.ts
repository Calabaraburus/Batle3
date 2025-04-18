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
import { CardEffect } from "./CardEffect";
import { Line } from "./Line";
const { ccclass, property } = _decorator;

@ccclass("lightning")
export class lightning extends Component {
  private _draw: Graphics | null;
  private _curDetail: number;
  private _cache: ObjectsCache | null;
  private _effectsNode: Node | null | undefined;

  @property({ type: Color })
  color1: Color;

  @property({ type: Color })
  color2: Color;

  @property({ type: Color })
  color3: Color;

  @property(CCFloat)
  width1 = 3;

  @property(CCFloat)
  width2 = 7;

  @property(CCFloat)
  width3 = 14;

  onLoad() {
    this._draw = this.node.getComponent(Graphics); // Get the Graphics component of this node
    this._curDetail = 30; // This parameter affects the length of each segment of the lightning, the smaller the value, the more delicate the lightning
  }

  start() {
    this._cache = ObjectsCache.instance;
    this._effectsNode = director.getScene()?.getChildByPath("LevelView/MainField/ParticleEffects");
  }
  // Draw a line segment. The parameters such as the width and color of the line segment are set in the external Graphics panel.
  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this._draw?.moveTo(x1, y1); // Set the starting point of the path
    this._draw?.lineTo(x2, y2); // end
    this._draw?.stroke(); // fill path
  }

  drawLines(lines: Vec4[], color: Color, width: number) {
    this._draw!.strokeColor = color;
    this._draw!.lineWidth = width;
    lines.forEach((p) => {
      this.drawLine(p.x, p.y, p.z, p.w);
    });
  }

  // Draw a lightning bolt. Lightning consists of multiple line segments. The parameter displacement affects the intensity of lightning, the larger the value, the more intense it is.
  getLightningPoints(
    lines: Vec4[],
    point1: Vec2,
    point2: Vec2,
    displace: number
  ) {
    if (displace < this._curDetail) {
      lines.push(new Vec4(point1.x, point1.y, point2.x, point2.y));
    } else {
      let mid_x = (point1.x + point2.x) / 2;
      let mid_y = (point1.y + point2.y) / 2;
      mid_x += (Math.random() - 0.5) * displace;
      mid_y += (Math.random() - 0.5) * displace;

      this.getLightningPoints(
        lines,
        point1,
        new Vec2(mid_x, mid_y),
        displace / 2
      );
      this.getLightningPoints(
        lines,
        point2,
        new Vec2(mid_x, mid_y),
        displace / 2
      );
    }
  }

  drawLightning(
    positions: Line[],
    color: Color,
    width: number,
    displace: number
  ) {
    const lightLines: Vec4[] = [];

    positions.forEach((element) => {
      this.getLightningPoints(
        lightLines,
        element.startPoint,
        element.endPoint,
        displace
      );
    });

    this.drawLines(lightLines, this.color3, this.width3);
    this.drawLines(lightLines, this.color2, this.width2);
    this.drawLines(lightLines, this.color1, this.width1);
  }

  private redrawTime = 0;
  private _lighningVectors: Line[] = [];
  private _lightningIsEnabled: boolean;

  public makeLightning(vectors: Line[]) {
    this._lightningIsEnabled = true;
    this._lighningVectors = [];
    const timerObj = { time: 0 };

    const animator = tween(timerObj);

    const effects: CardEffect[] = [];

    vectors.forEach((v, i) => {
      let tileLightninEffect: CardEffect | null | undefined;

      if (i == 0) {
        tileLightninEffect =
          this._cache?.getObjectByPrefabName<CardEffect>("lightningEffect");
        if (tileLightninEffect != null) {
          this.setTileEffect(tileLightninEffect, v.startPoint);
          effects.push(tileLightninEffect);
        }
      }

      animator.to(0.1, { time: 1 }).call(() => {
        this._lighningVectors.push(v);
        tileLightninEffect =
          this._cache?.getObjectByPrefabName<CardEffect>("lightningEffect");
        if (tileLightninEffect == null) return;
        effects.push(tileLightninEffect);

        this.setTileEffect(tileLightninEffect, v.endPoint);
      });
    });

    animator
      .delay(1)
      .call(() => {
        this.stopLightning();
        effects.forEach((e) => e.stopEmmit());
      })
      .delay(2)
      .call(() => effects.forEach((e) => e.cacheDestroy()))
      .start();
  }

  private setTileEffect(effect: CardEffect, pos: Vec2) {
    if (this._effectsNode == null) {
      return;
    }

    effect.node.position = new Vec3(pos.x, pos.y, effect.node.position.z);
    effect.node.parent = this._effectsNode;
    effect.play();
  }

  public stopLightning() {
    this._lightningIsEnabled = false;
    this._draw?.clear();
  }

  // refresh every frame
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(dt: number) {
    if (!this._lightningIsEnabled) {
      return;
    }

    if (this.redrawTime <= 0) {
      this.redrawTime = 0.05;

      // First clear everything that Graphics has drawn, otherwise it will overlap with the previous frame.
      this._draw?.clear();

      // draw a lightning
      this.drawLightning(this._lighningVectors, this.color1, this.width1, 250);
    }
    this.redrawTime -= dt;
  }
}
