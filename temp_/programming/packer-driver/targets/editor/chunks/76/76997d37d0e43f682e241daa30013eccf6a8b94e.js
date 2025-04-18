System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, FieldController, _dec, _class, _crd, ccclass, property, TileInterBehaviour;

  function _reportPossibleCrUseOfFieldController(extras) {
    _reporterNs.report("FieldController", "../field/FieldController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "./TileController", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }, function (_unresolved_2) {
      FieldController = _unresolved_2.FieldController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f8d52q+otZH15PxmTMDFIaa", "TileInterBehaviour", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Implements tile behaviour
       */

      _export("TileInterBehaviour", TileInterBehaviour = (_dec = ccclass('TileInterBehaviour'), _dec(_class = class TileInterBehaviour extends Component {
        constructor(...args) {
          super(...args);
          this._field = void 0;
        }

        get field() {
          return this._field;
        }

        start() {
          this._field = this.getComponent(_crd && FieldController === void 0 ? (_reportPossibleCrUseOfFieldController({
            error: Error()
          }), FieldController) : FieldController);

          this._field.tileClickedEvent.on('FieldController', this.tileClicked, this);
        }

        tileClicked(field, tile) {}

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=76997d37d0e43f682e241daa30013eccf6a8b94e.js.map