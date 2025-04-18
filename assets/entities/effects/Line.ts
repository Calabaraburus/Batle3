import { Vec2 } from "cc";

export class Line {
  public startPoint: Vec2;
  public endPoint: Vec2;

  constructor(startPoint: Vec2, endPoint: Vec2) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  }
}
