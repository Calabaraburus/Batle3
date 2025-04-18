System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, UITransform, Vec3, randomRangeInt, EventTarget, TileController, StdTileController, FieldModel, TileCreator, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, FieldController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../tiles/TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileModel(extras) {
    _reporterNs.report("TileModel", "../../models/TileModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStdTileController(extras) {
    _reporterNs.report("StdTileController", "../tiles/UsualTile/StdTileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFieldModel(extras) {
    _reporterNs.report("FieldModel", "../../models/FieldModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileCreator(extras) {
    _reporterNs.report("TileCreator", "./TileCreator", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
      randomRangeInt = _cc.randomRangeInt;
      EventTarget = _cc.EventTarget;
    }, function (_unresolved_2) {
      TileController = _unresolved_2.TileController;
    }, function (_unresolved_3) {
      StdTileController = _unresolved_3.StdTileController;
    }, function (_unresolved_4) {
      FieldModel = _unresolved_4.FieldModel;
    }, function (_unresolved_5) {
      TileCreator = _unresolved_5.TileCreator;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a1d8d50jUFNB7KWPlRH5rMr", "FieldController", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("FieldController", FieldController = (_dec = ccclass('FieldController'), _dec2 = property({
        type: [_crd && FieldModel === void 0 ? (_reportPossibleCrUseOfFieldModel({
          error: Error()
        }), FieldModel) : FieldModel],
        visible: true,
        tooltip: 'Field model'
      }), _dec3 = property(UITransform), _dec4 = property(_crd && TileCreator === void 0 ? (_reportPossibleCrUseOfTileCreator({
        error: Error()
      }), TileCreator) : TileCreator), _dec(_class = (_class2 = class FieldController extends Component {
        constructor(...args) {
          super(...args);
          this.tileClickedEvent = new EventTarget();

          _initializerDefineProperty(this, "fieldModel", _descriptor, this);

          _initializerDefineProperty(this, "tilesArea", _descriptor2, this);

          _initializerDefineProperty(this, "tileCreator", _descriptor3, this);

          this._field = void 0;
          this._timeToexecute = 0;
          this._canexecute = false;
        }

        get logicField() {
          return this._field;
        }

        start() {
          this.tileCreator.setModel(this.fieldModel);
          this.generateTiles();
          this.analizeTiles();
        }
        /**
         * Generate tile field
         */


        generateTiles() {
          console.log("[field] Rows: " + this.fieldModel.rows + " Cols: " + this.fieldModel.cols);
          this._field = [];
          const map = this.fieldModel.getFieldMap();

          for (let yIndex = 0; yIndex < this.fieldModel.rows; yIndex++) {
            this._field[yIndex] = [];

            for (let xIndex = 0; xIndex < this.fieldModel.rows; xIndex++) {
              let tileModel = this.fieldModel.getTileModelByMapMnemonic(map[yIndex][xIndex]);
              let tile = this.createTile({
                row: yIndex,
                col: xIndex,
                tileModel,
                putOnField: true
              });
            }
          }
        }
        /**
         * Creates tile instance
         * @param row row position on logic field
         * @param col col position on logic field
         * @param tileModel tile model
         * @param position real position on scene
         * @param putOnField determines the need of putting tile on logic field
         * (game puts tile only to the scene)
         * @returns 
         */


        createTile({
          row,
          col,
          tileModel,
          position = null,
          putOnField = false
        }) {
          const tile = this.tileCreator.create(tileModel.tileName);
          const tileController = tile.getComponent(_crd && TileController === void 0 ? (_reportPossibleCrUseOfTileController({
            error: Error()
          }), TileController) : TileController);
          tileController.justCreated = true;
          tileController.setModel(tileModel);
          tileController.row = row;
          tileController.col = col;
          tileController.clickedEvent.on('TileController', this.tileClicked, this);
          var tPos = this.calculateTilePosition(row, col);
          tile.position = position == null ? tPos : position;
          tile.parent = this.node;
          const size = this.calculateTileSize(tile);
          tile.scale = size;

          if (putOnField) {
            this._field[row][col] = tileController;
          }

          return tileController;
        }

        calculateTilePosition(row, col) {
          const border = this.fieldModel.border / 2;
          let tW = this.tilesArea.width / this.fieldModel.cols;
          return new Vec3(col * tW + border, row * tW + border);
        }

        calculateTileSize(tile) {
          //onst border = this.fieldModel.border / 2;
          let tileTransform = tile.getComponent(UITransform);
          let tW = this.tilesArea.width / this.fieldModel.cols;
          let coef = tW / (tileTransform.width + this.fieldModel.border);
          return new Vec3(coef, coef, tile.scale.z);
        }
        /**
         * Method invokes when one of tiles is clicked
         * @param tile tile controller of clicked tile
         */


        tileClicked(tile) {
          if (this._timeToexecute > 0) return;
          console.log("[tile] clicked. Name: " + tile.tileModel.tileName);
          this.tileClickedEvent.emit('FieldController', this, tile);
          this._timeToexecute = .2;
          this._canexecute = true;
        }
        /**
         * Get tiles that connected to each other
         * @param tile initial tile
         * @returns all connected tiles with same type
         */


        getConnectedTiles(tile) {
          let connectedTiles = new Set();
          this.findConnectedTiles(tile, connectedTiles);
          return Array.from(connectedTiles.values());
        }
        /**
         * Find all connecticted tiles of same type
         * @param tile initial tile
         * @param resultSet set of connected tiles
         */


        findConnectedTiles(tile, resultSet) {
          let addTile = (current, other) => {
            if (current.tileTypeId == other.tileTypeId) {
              if (!resultSet.has(other)) {
                resultSet.add(other);
                this.findConnectedTiles(other, resultSet);
              }
            }
          };

          if (tile.row + 1 < this.fieldModel.rows) {
            addTile(tile, this._field[tile.row + 1][tile.col]);
          }

          if (tile.row - 1 >= 0) {
            addTile(tile, this._field[tile.row - 1][tile.col]);
          }

          if (tile.col + 1 < this.fieldModel.cols) {
            addTile(tile, this._field[tile.row][tile.col + 1]);
          }

          if (tile.col - 1 >= 0) {
            addTile(tile, this._field[tile.row][tile.col - 1]);
          }
        }

        moveAllTilesOnARote(roteId) {
          const startTile = this.getStartTile(roteId);
          const endTile = this.getEndTile(roteId);
          const emptyModel = this.fieldModel.getTileModel("empty");

          if (startTile == null || endTile == null) {
            return;
          }

          const findTiles = destroied => {
            let res = [];

            this._field.forEach(row => {
              if (row[roteId].isDestroied == destroied && row[roteId] != startTile && row[roteId] != endTile && row[roteId].tileTypeId != emptyModel.tileId) {
                res.push(row[roteId]);
              }
            });

            return res;
          };

          const fwd = endTile.row > startTile.row;
          const destroiedTiles = findTiles(true);

          if (destroiedTiles.length == 0) {
            return;
          }

          const stdTileModels = this.fieldModel.getStandartTiles();
          let pathTiles = []; // add new tiles

          for (let index = 0; index < destroiedTiles.length; index++) {
            let tileRowId = fwd ? startTile.row + 1 + index : startTile.row - 1 - index;
            let yPosIndex = fwd ? startTile.row - 1 - index : startTile.row + 1 + index;
            var tile = this.createTile({
              row: tileRowId,
              col: roteId,
              tileModel: stdTileModels[randomRangeInt(0, stdTileModels.length)],
              position: this.calculateTilePosition(yPosIndex, startTile.col)
            });
            pathTiles[fwd ? index : destroiedTiles.length - index - 1] = tile;
          }

          var liveTiles = findTiles(false);
          liveTiles.forEach((t, i) => {
            pathTiles[destroiedTiles.length + (fwd ? i : liveTiles.length - i - 1)] = t;
          });
          pathTiles.forEach((t, i) => {
            let tileRowId = fwd ? startTile.row + 1 + i : startTile.row - 1 - i;
            t.row = tileRowId;
            this._field[t.row][t.col] = t;
            this.moveTile(t, this.calculateTilePosition(t.row, t.col));
          });
        }

        analizeTiles() {
          this.PrepareTilesForAnalize();

          this._field.forEach((row, i) => {
            row.forEach((tile, i) => {
              let set = new Set();
              this.findConnectedTiles(tile, set);

              if (set.size > 1) {
                this.AnalizeConnects(set);
              } else {
                if (tile instanceof (_crd && StdTileController === void 0 ? (_reportPossibleCrUseOfStdTileController({
                  error: Error()
                }), StdTileController) : StdTileController)) {
                  const stdTile = tile;
                  stdTile.resetSpecialSprite();
                }
              }

              tile.justCreated = false;
              tile.tileAnalized = true;
            });
          });
        }

        AnalizeConnects(set) {
          set.forEach(tile => {
            if (tile.tileAnalized) {
              return;
            }

            if (tile instanceof (_crd && StdTileController === void 0 ? (_reportPossibleCrUseOfStdTileController({
              error: Error()
            }), StdTileController) : StdTileController)) {
              const stdTile = tile;

              if (set.size >= this.fieldModel.quantityToStar) {
                stdTile.setStar();
              } else if (set.size >= this.fieldModel.quantityToBomb) {
                stdTile.setBomb();
              } else if (set.size >= this.fieldModel.quantityToRocket) {
                stdTile.setRocket();
              } else {
                stdTile.resetSpecialSprite();
              }
            }
          });
        }

        PrepareTilesForAnalize() {
          this._field.forEach((row, i) => {
            row.forEach((tile, i) => {
              if (tile.isDestroied) {
                if (this._field[tile.row][tile.col] == tile) {
                  this._field[tile.row][tile.col] == null;
                }
              }

              tile.tileAnalized = false;
            });
          });
        }

        moveTile(tile, position) {
          tile.move(tile.node.position, position);
        }

        getStartTile(roteId) {
          const startModel = this.fieldModel.getTileModel('start');
          return this.getTile(roteId, startModel);
        }

        getEndTile(roteId) {
          const startModel = this.fieldModel.getTileModel('end');
          return this.getTile(roteId, startModel);
        }

        getTile(roteId, tileType) {
          let res = null;

          this._field.forEach((row, i) => {
            if (row[roteId].tileTypeId == tileType.tileId) {
              res = row[roteId];
              return;
            }
          });

          return res;
        }

        update(deltaTime) {
          if (this._timeToexecute < 0 && this._canexecute) {
            this._canexecute = false;

            for (let index = 0; index < this.fieldModel.cols; index++) {
              this.moveAllTilesOnARote(index);
            }

            this.analizeTiles();
          }

          this._timeToexecute -= deltaTime;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "fieldModel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tilesArea", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "tileCreator", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=bd39c98d79b7dbeb9b38299d22313a7b99b4f42e.js.map