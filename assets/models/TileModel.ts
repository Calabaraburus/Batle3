//  TileModel.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { _decorator, Component, SpriteFrame, CCInteger, Color } from "cc";
import { AdittionalSprite as AdditionalSprite } from "./AdittionalSprite";
const { ccclass, property } = _decorator;

/**
 * Represents tile model
 */
@ccclass("TileModel")
export class TileModel extends Component {
  static s_tileId = 0;
  private _tileId: number;

  get tileId() {
    return this._tileId;
  }

  @property({ visible: true })
  tileName = "";

  @property({ visible: true })
  baseTileName = "";

  @property({ type: SpriteFrame, visible: true })
  sprite: SpriteFrame;

  @property({ visible: true })
  starColor: Color = new Color();

  @property({ visible: true })
  specialTile = false;

  @property({ visible: true })
  serviceTile = false;

  @property({ visible: true })
  tags = "";

  @property({ visible: true })
  dangerRating = 1;

  @property({ type: AdditionalSprite, visible: true })
  additionalSprites: AdditionalSprite[] = [];

  private splitedTags: string[] = [];
  private t_tags: string;

  public getTags(): string[] {
    this.splitTags();
    return this.splitedTags;
  }

  constructor() {
    super();

    this._tileId = TileModel.s_tileId;
    TileModel.s_tileId++;
  }

  public containsTag(tag: string): boolean {
    this.splitTags();
    return this.splitedTags.findIndex((val) => val == tag) == -1 ? false : true;
  }

  private splitTags(): void {
    if (this.t_tags != this.tags) {
      this.t_tags = this.tags;
      this.splitedTags = this.tags
        .split(" ")
        .map((s) => s.trim().replace("#", ""));
    }
  }

  public findAdditionalSprite(name: string): SpriteFrame | null {
    const res = this.additionalSprites.filter((item) => item.name == name);

    if (res.length != 0) {
      return res[0].sprite;
    } else {
      return null;
    }
  }
}
