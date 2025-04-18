System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, TileInterBehaviour, BombTileController, _dec, _class, _crd, ccclass, property, BombTileInterBehaviour;

  function _reportPossibleCrUseOfFieldController(extras) {
    _reporterNs.report("FieldController", "../../field/FieldController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileInterBehaviour(extras) {
    _reporterNs.report("TileInterBehaviour", "../TileInterBehaviour", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBombTileController(extras) {
    _reporterNs.report("BombTileController", "./BombTileController", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
    }, function (_unresolved_2) {
      TileInterBehaviour = _unresolved_2.TileInterBehaviour;
    }, function (_unresolved_3) {
      BombTileController = _unresolved_3.BombTileController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "79c62x/GzlJt4JGgXTURFNQ", "BombTileInterBehaviour", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Implements behaviour for bomb tiles
       */

      _export("BombTileInterBehaviour", BombTileInterBehaviour = (_dec = ccclass('BombTileInterBehaviour'), _dec(_class = class BombTileInterBehaviour extends (_crd && TileInterBehaviour === void 0 ? (_reportPossibleCrUseOfTileInterBehaviour({
        error: Error()
      }), TileInterBehaviour) : TileInterBehaviour) {
        tileClicked(field, tile) {
          if (!(tile instanceof (_crd && BombTileController === void 0 ? (_reportPossibleCrUseOfBombTileController({
            error: Error()
          }), BombTileController) : BombTileController))) {
            return;
          }

          var bombTile = tile;
          var startRow = tile.row - bombTile.fireDistance;
          startRow = startRow < 0 ? 0 : startRow;
          var endRow = tile.row + bombTile.fireDistance;
          endRow = endRow >= field.fieldModel.rows ? field.fieldModel.rows - 1 : endRow;
          var startCol = tile.col - bombTile.fireDistance;
          startCol = startCol < 0 ? 0 : startCol;
          var endCol = tile.col + bombTile.fireDistance;
          endCol = endCol >= field.fieldModel.cols ? field.fieldModel.cols - 1 : endCol;

          var iterateTiles = callback => {
            for (var i = startRow; i <= endRow; i++) {
              for (var j = startCol; j <= endCol; j++) {
                var _t = field.logicField[i][j];
                callback(_t);
              }
            }
          };

          iterateTiles(t => {
            if (!t.isDestroied && t.tileModel.tileName != "star" && (t.tileModel.tileName == "rocket" || t.tileModel.tileName == "bomb")) {
              t.activate();
            }
          });
          iterateTiles(t => {
            if (!t.isDestroied && t.tileModel.tileName != "star") {
              t.destroyTile();
            }
          });
          bombTile.destroyTile();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4ec7ed56c38ae89cf9735a6f90c8bdb018d57d6e.js.map