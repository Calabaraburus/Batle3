import { PikeCardSubehaviour } from "./PikeCardSubehaviour";

export class PikeMiddleCardSubehaviour extends PikeCardSubehaviour {
  protected powerCard = 2;
  protected coordsCol = [
    [-1, 1],
    [0, 0],
    [0, 0],
  ];
}
