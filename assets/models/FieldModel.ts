//  FieldModel.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import {
  _decorator,
  Component,
  CCInteger,
  CCFloat,
  TextAsset,
  Button,
  random,
  randomRange,
  randomRangeInt,
  Node
} from "cc";
import { TileModel } from "./TileModel";
import { MnemonicMapping } from "./MnemonicMapping";
import { BonusModel } from "./BonusModel";
const { ccclass, property } = _decorator;

/**
 * Represents game field model. This model contains field metadata
 */
@ccclass("FieldModel")
export class FieldModel extends Component {
  private tilesGroupDict = new Map<string, TileModel[]>();
  private _tiles: TileModel[] = [];


  /**
   * Tiles cols count
   */
  @property({ type: CCInteger })
  cols = 15;

  /**
   * Tiles rows count
   */
  @property({ type: CCInteger })
  rows = 15;

  /**
   * Tile margin
   */
  @property({ type: CCFloat })
  border = 0.1;

  /**
   * Quantity of tiles to create rocket
   */
  @property({ type: CCInteger })
  quantityToRocket = 5;

  /**
   * Quantity of tiles to create bomb
   */
  @property({ type: CCInteger })
  quantityToBomb = 8;

  /**
   * Quantity of tiles to create star
   */
  @property({ type: CCInteger })
  quantityToStar = 11;

  /**
   * Tile model collection
   */
  @property({ type: Node, visible: true, tooltip: "Node with tile models" })
  tilesNode: Node;

  /**
   * Field map
   */
  @property({ type: [TextAsset], visible: true, tooltip: "Field map" })
  fieldMap: TextAsset;

  /**
   * Tile mnemonic mapping
   */
  @property({
    type: [MnemonicMapping],
    visible: true,
    tooltip: "Tile mnemonic mapping",
  })
  mnemMapping: MnemonicMapping[] = [];

  start(): void {
    this._tiles = this.tilesNode.children.flatMap(cn => cn.getComponent(TileModel) ?? []);
  }

  /**
   * Get standart tile models
   * @returns collection of std tile models
   */
  public getStandartTiles(): TileModel[] {
    return this._tiles.filter((item) => !item.specialTile);
  }

  /**
   * Gets tile model by type name
   * @param typeName Type name
   * @returns Tile model
   */
  public getTileModel(typeName: string): TileModel {
    return this._tiles.filter((item) => item.tileName == typeName)[0];
  }

  /**
   * Gets tile model by mapmnemonic
   * @param mnemonic Type name
   * @returns Tile model
   */
  public getTileModelByMapMnemonic(mnemonic: string): TileModel | null {
    const tileName = this.getTileNameByMnem(mnemonic);

    if (tileName == "") {
      return this._tiles.filter((item) => item.tileName == mnemonic)[0];
    }

    if (tileName.startsWith("#")) {
      return this.getTileModelByGroupName(tileName.replace("#", ""));
    }

    const res = this._tiles.filter((item) => item.tileName == tileName);
    return res.length != 0 ? res[0] : this._tiles[0];
  }

  /**
   * Get random tile model by tag
   * @param groups Tile model tags
   * @returns Returns tile model filtered by tags.
   * If model not exists returns null.
   */
  public getTileModelByGroupName(...groups: string[]): TileModel | null {
    let tiles: TileModel[] | undefined;
    const jntgrp = groups.join();
    if (!this.tilesGroupDict.has(jntgrp)) {
      tiles = this.getTileModelsByTags(jntgrp);
      this.tilesGroupDict.set(jntgrp, tiles);
    }

    tiles = this.tilesGroupDict.get(jntgrp);

    if (tiles?.length == 0) return null;

    if (tiles != null) {
      return tiles[randomRangeInt(0, tiles?.length)];
    } else {
      return null;
    }
  }

  /**
   * Get name of tile model by tile mnemonic
   * @param mnemonic Mnemonic
   * @returns return tile model name
   */
  public getTileNameByMnem(mnemonic: string): string {
    const map = this.mnemMapping.filter((item) => item.mnemonic == mnemonic);
    return map.length == 0 ? "" : map[0].tileName;
  }

  /**
   * Get models by tag
   */
  public getTileModelsByTags(...tags: string[]): TileModel[] {
    return this._tiles.filter((item) => {
      let exists = false;
      tags.forEach((tag) => {
        if (item.containsTag(tag)) {
          exists = true;
          return;
        }
      });

      return exists;
    });
  }

  /**
   * Get field map represented as string matrix
   * @returns Returns string matrix, e.g.: string[][]
   */
  public getFieldMap(): string[][] {
    const result: string[][] = [];

    const textLines = this.fieldMap.text.split(/\r?\n/);
    textLines.forEach((line, i) => {
      const iinv = textLines.length - i - 1;
      result[iinv] = [];
      //for (let j = 0; j < line.length; j++) {
      result[iinv] = line.split("|").map(s => s.trim());//.charAt(j);
      //}
    });
    return result;
  }
}
