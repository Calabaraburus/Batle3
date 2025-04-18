System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, StarTileController, TileInterBehaviour, TileState, StdTileController, _dec, _class, _crd, ccclass, property, StdTileInterBehaviour;

  function _reportPossibleCrUseOfFieldController(extras) {
    _reporterNs.report("FieldController", "../../field/FieldController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStarTileController(extras) {
    _reporterNs.report("StarTileController", "../StarTile/StarTileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileInterBehaviour(extras) {
    _reporterNs.report("TileInterBehaviour", "../TileInterBehaviour", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileState(extras) {
    _reporterNs.report("TileState", "../TileState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStdTileController(extras) {
    _reporterNs.report("StdTileController", "./StdTileController", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
    }, function (_unresolved_2) {
      StarTileController = _unresolved_2.StarTileController;
    }, function (_unresolved_3) {
      TileInterBehaviour = _unresolved_3.TileInterBehaviour;
    }, function (_unresolved_4) {
      TileState = _unresolved_4.TileState;
    }, function (_unresolved_5) {
      StdTileController = _unresolved_5.StdTileController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cc7bcjVq1FOx5SiTxSWWi8P", "StdTileInterBehaviour", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Implements behaviour for simple tiles
       */

      _export("StdTileInterBehaviour", StdTileInterBehaviour = (_dec = ccclass('StdTileInterBehaviour'), _dec(_class = class StdTileInterBehaviour extends (_crd && TileInterBehaviour === void 0 ? (_reportPossibleCrUseOfTileInterBehaviour({
        error: Error()
      }), TileInterBehaviour) : TileInterBehaviour) {
        constructor() {
          super();
          this.tileStateToLogic = new Map();
          this.tileStateToLogic[(_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).bomb] = "bomb";
          this.tileStateToLogic[(_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).empty] = "empty";
          this.tileStateToLogic[(_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).rocket] = "rocket";
          this.tileStateToLogic[(_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).star] = "star";
        }

        tileClicked(field, tile) {
          if (!(tile instanceof (_crd && StdTileController === void 0 ? (_reportPossibleCrUseOfStdTileController({
            error: Error()
          }), StdTileController) : StdTileController))) {
            return;
          }

          let connectedTiles = field.getConnectedTiles(tile);
          const stdTile = tile;
          let modelName = this.tileStateToLogic[stdTile.state];
          var model = this.field.fieldModel.getTileModel(modelName);

          if (model != null && stdTile.state != (_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).empty) {
            const resTile = field.createTile({
              row: tile.row,
              col: tile.col,
              tileModel: model,
              putOnField: true
            });

            if (resTile instanceof (_crd && StarTileController === void 0 ? (_reportPossibleCrUseOfStarTileController({
              error: Error()
            }), StarTileController) : StarTileController)) {
              const star = resTile;
              star.createdForm(tile.tileModel);
            }
          }

          connectedTiles.forEach(item => item.destroyTile());
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e4ba68b8eb260f3973cf5818473b457cbc94a3fe.js.map