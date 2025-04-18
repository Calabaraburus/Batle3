System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd, TileState;

  _export("TileState", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "12ab47R9F5Ex4ST9HEH2pXu", "TileState", undefined);

      (function (TileState) {
        TileState[TileState["empty"] = 0] = "empty";
        TileState[TileState["star"] = 1] = "star";
        TileState[TileState["bomb"] = 2] = "bomb";
        TileState[TileState["rocket"] = 3] = "rocket";
      })(TileState || _export("TileState", TileState = {}));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2ea618981f4f493ee2da997741998e3ee242076d.js.map