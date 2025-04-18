import { Vec3 } from "cc";
import { FieldModel } from "../../models/FieldModel";
import { TileModel } from "../../models/TileModel";
import { TileController } from "../tiles/TileController";
import { CreateTileArgs } from "./CreateTileArgs";
import { ReadonlyMatrix2D } from "./ReadonlyMatrix2D";

export interface ITileFieldController {

  get onTileCreating(): (tile: TileController) => void;
  set onTileCreating(callback: (tile: TileController) => void);

  get fieldMatrix(): ReadonlyMatrix2D<TileController>;
  get fieldModel(): FieldModel;
  get tiles(): Array<TileController>;
  getStartTile(roteId: number): TileController | null;
  getEndTile(roteId: number): TileController | null;
  getTile(roteId: number, tileType: TileModel): TileController | null;
  moveTilesLogicaly(backwards: boolean): void;
  moveTiles(backwards: boolean): void;
  destroyTile(
    row: number,
    col: number,
    creteria: (tc: TileController) => boolean,
    destroyServiceTile?: boolean
  ): TileController | null;
  generateTiles(): void;
  createTile({
    row,
    col,
    tileModel,
    playerModel,
    position,
    putOnField,
  }: CreateTileArgs): TileController | null;
  fakeDestroyTile(tile: TileController): void;
  markTileForDestraction(tile: TileController): void;
  fixTiles(): void;
  mixTiles(): void;
  exchangeTiles(t1: TileController, t2: TileController): void;
  analizeTiles(): void;
  calculateTilePosition(row: number, col: number): Vec3;
  flush(): void;
  reset(): void;
}
