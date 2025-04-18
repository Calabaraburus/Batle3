import { PlayerModel } from "../models/PlayerModel";
import { TileController } from "../entities/tiles/TileController";
import { FieldControllerExtensions } from "../entities/field/FieldExtensions";
import { StdTileController } from "../entities/tiles/UsualTile/StdTileController";


export class RaitingEvaluator {

    private _tileAttackCoef = 20;
    private _potentialAttackCoef = 1;
    private _shieldTileWeightCoef = 2;
    private _fieldExt: FieldControllerExtensions;
    private _playerModel: PlayerModel;
    private _enemyModel: PlayerModel;
    private _playerBaseTiles: TileController[];
    private _enemyBaseTiles: TileController[];
    private _evaluationTileStrategies = new Map<string, (t: TileController, isEnemyTile: boolean) => number>();

    public constructor(fieldExt: FieldControllerExtensions, playerModel: PlayerModel, enemyModel: PlayerModel) {
        this._fieldExt = fieldExt;
        this._playerModel = playerModel;
        this._enemyModel = enemyModel;
        this._playerBaseTiles = fieldExt.findTilesByModelName("end");
        this._enemyBaseTiles = fieldExt.findTilesByModelName("start");

        this.fillEvaluations();
    }

    public set fieldExt(value: FieldControllerExtensions) {
        this._fieldExt = value;
    }

    public get fieldExt(): FieldControllerExtensions {
        return this._fieldExt;
    }

    fillEvaluations() {
        this._evaluationTileStrategies.set("mine", this.safePlaceEvStrategy.bind(this));
        this._evaluationTileStrategies.set("catapult", this.safePlaceEvStrategy.bind(this));
        this._evaluationTileStrategies.set("shaman", this.safePlaceEvStrategy.bind(this));
        this._evaluationTileStrategies.set("assassin", this.safePlaceEvStrategy.bind(this));

    }

    safePlaceEvStrategy(t: TileController, isEnemyTile: boolean): number {
        if (isEnemyTile) {
            return t.tileModel.dangerRating
        } else {
            return t.tileModel.dangerRating / (2 * (this.tileDangNeigboursCount(t) + 1));
        }
    }

    tileDangNeigboursCount(tile: TileController): number {
        const closestTiles = this._fieldExt.closest(tile);
        let count = 0;
        for (const tileInnr of closestTiles) {
            const c_count = this._fieldExt.countTilesOfSameGroup(this._fieldExt.closest(tileInnr), tileInnr.tileModel);

            if (c_count > 0) {
                count++;
            }
        }
        return count;
    }

    EvaluateRating(t: TileController, isEnemyTile: boolean) {
        if (t instanceof (StdTileController) && t.shieldIsActivated) {
            return this._shieldTileWeightCoef;
        } else {
            if (this._evaluationTileStrategies.has(t.tileModel.baseTileName.toLowerCase())) {
                const ev = this._evaluationTileStrategies.get(t.tileModel.baseTileName.toLowerCase());
                if (ev) {
                    return ev(t, isEnemyTile);
                }
            }
        }

        return t.tileModel.dangerRating;
    }

    /**
     * @en Returns rating for game state
     */
    public getRating(): number {

        const playerTiles = this._fieldExt.getPlayerTiles(this._playerModel);
        const enemyTiles = this._fieldExt.getPlayerTiles(this._enemyModel);

        let result = 0;
        playerTiles.forEach((t) => {
            const distToEnemyBase = this._fieldExt.getVerticalDistance(t, this._enemyBaseTiles[0]);

            if (distToEnemyBase <= 1) {
                result += this._tileAttackCoef;
            }

            result += this.EvaluateRating(t, false);
        });

        let columnsCanAtackCount = this.countColumnCanBeAttackNextTurn(this._enemyModel, this._enemyBaseTiles);

        result += columnsCanAtackCount * this._potentialAttackCoef

        enemyTiles.forEach((t) => {
            const distToPlayerBase = this._fieldExt.getVerticalDistance(t, this._playerBaseTiles[0]);
            if (distToPlayerBase <= 1) {
                result -= this._tileAttackCoef;
            }

            result -= this.EvaluateRating(t, true);
        });

        columnsCanAtackCount = this.countColumnCanBeAttackNextTurn(this._playerModel, this._playerBaseTiles);

        result -= columnsCanAtackCount * this._potentialAttackCoef

        return result;
    }

    private countColumnCanBeAttackNextTurn(playerModel: PlayerModel, baseTiles: TileController[]) {
        let res = 0;
        for (let index = 0; index < this._fieldExt.field.fieldMatrix.cols; index++) {
            if (this.isColumnHasDestructableTilesOfOneType(index, playerModel, baseTiles)) {
                res++;
            }
        }

        return res;
    }

    private isColumnHasDestructableTilesOfOneType(colId: number, playerModel: PlayerModel, baseTiles: TileController[]) {
        let prevTile: TileController | null = null;

        let cnt = 0;
        //let isConnected = false;

        for (let ri = 0; ri < this._fieldExt.field.fieldMatrix.rows; ri++) {
            const tile = this._fieldExt.field.fieldMatrix.get(ri, colId);

            if (tile.tileModel == this._enemyBaseTiles[0].tileModel ||
                tile.tileModel == this._playerBaseTiles[0].tileModel) {
                continue;
            }

            if (tile.playerModel == playerModel) {
                if (prevTile == null) {
                    prevTile = tile;
                    cnt = 1;
                    continue;
                }

                if (Math.abs(prevTile.row - tile.row) > 1) {
                    return false;
                }

                if (prevTile.tileModel != tile.tileModel) {
                    return false;
                }

                cnt += 1
                prevTile = tile
            }
        }

        if (cnt == 1 && prevTile) {
            const ltile = this._fieldExt.field.fieldMatrix.getSafe(prevTile.row, prevTile.col - 1);
            const rtile = this._fieldExt.field.fieldMatrix.getSafe(prevTile.row, prevTile.col + 1);

            if (!(ltile?.tileModel == prevTile.tileModel || rtile?.tileModel == prevTile.tileModel)) {
                return false;
            }
        }

        return true;
    }
}


