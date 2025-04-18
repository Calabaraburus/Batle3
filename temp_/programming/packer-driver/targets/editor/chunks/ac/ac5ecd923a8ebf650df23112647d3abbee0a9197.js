System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, TileInterBehaviour, RocketTileController, _dec, _class, _crd, ccclass, property, RocketTileInterBehaviour;

  function _reportPossibleCrUseOfFieldController(extras) {
    _reporterNs.report("FieldController", "../../field/FieldController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileInterBehaviour(extras) {
    _reporterNs.report("TileInterBehaviour", "../TileInterBehaviour", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRocketTileController(extras) {
    _reporterNs.report("RocketTileController", "./RocketTileController", _context.meta, extras);
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
      RocketTileController = _unresolved_3.RocketTileController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f7470kCYepAtZe6bRPeTzmR", "RocketTileInterBehaviour", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Implements behaviour for rocket tiles
       */

      _export("RocketTileInterBehaviour", RocketTileInterBehaviour = (_dec = ccclass('RocketTileInterBehaviour'), _dec(_class = class RocketTileInterBehaviour extends (_crd && TileInterBehaviour === void 0 ? (_reportPossibleCrUseOfTileInterBehaviour({
        error: Error()
      }), TileInterBehaviour) : TileInterBehaviour) {
        tileClicked(field, tile) {
          if (!(tile instanceof (_crd && RocketTileController === void 0 ? (_reportPossibleCrUseOfRocketTileController({
            error: Error()
          }), RocketTileController) : RocketTileController))) {
            return;
          }

          const rocketTile = tile;

          if (!rocketTile.isVertical) {
            field.logicField[rocketTile.row].forEach(t => {
              if (!t.isDestroied && (t.tileModel.tileName == "rocket" || t.tileModel.tileName == "bomb")) {
                t.activate();
              }
            });
            field.logicField[rocketTile.row].forEach(t => {
              if (!t.isDestroied) {
                t.destroyTile();
              }
            });
          } else {
            field.logicField.forEach(row => {
              const t = row[tile.col];

              if (!t.isDestroied && t.tileModel.tileName != "star" && (t.tileModel.tileName == "rocket" || t.tileModel.tileName == "bomb")) {
                t.activate();
              }
            });
            field.logicField.forEach(row => {
              const t = row[tile.col];

              if (!t.isDestroied && t.tileModel.tileName != "star") {
                t.destroyTile();
              }
            });
          }

          rocketTile.destroyTile();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ac5ecd923a8ebf650df23112647d3abbee0a9197.js.map