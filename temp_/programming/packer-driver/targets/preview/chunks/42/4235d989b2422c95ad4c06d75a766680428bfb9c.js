System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, TileInterBehaviour, StarTileController, _dec, _class, _crd, ccclass, property, StarTileInterBehaviour;

  function _reportPossibleCrUseOfFieldController(extras) {
    _reporterNs.report("FieldController", "../../field/FieldController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileInterBehaviour(extras) {
    _reporterNs.report("TileInterBehaviour", "../TileInterBehaviour", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStarTileController(extras) {
    _reporterNs.report("StarTileController", "./StarTileController", _context.meta, extras);
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
      StarTileController = _unresolved_3.StarTileController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "997b1zfVZJBi6gAASkUiht6", "StarTileInterBehaviour", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Implements behaviour for bomb tiles
       */

      _export("StarTileInterBehaviour", StarTileInterBehaviour = (_dec = ccclass('StarTileInterBehaviour'), _dec(_class = class StarTileInterBehaviour extends (_crd && TileInterBehaviour === void 0 ? (_reportPossibleCrUseOfTileInterBehaviour({
        error: Error()
      }), TileInterBehaviour) : TileInterBehaviour) {
        tileClicked(field, tile) {
          if (!(tile instanceof (_crd && StarTileController === void 0 ? (_reportPossibleCrUseOfStarTileController({
            error: Error()
          }), StarTileController) : StarTileController))) {
            return;
          }

          var starTile = tile;
          field.logicField.forEach(r => {
            r.forEach(tile => {
              if (tile.tileModel.tileId == starTile.modelCreatedFrom.tileId) {
                tile.destroyTile();
              }
            });
          });
          starTile.destroyTile();
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4235d989b2422c95ad4c06d75a766680428bfb9c.js.map