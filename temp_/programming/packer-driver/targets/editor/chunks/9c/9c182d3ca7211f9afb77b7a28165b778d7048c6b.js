System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Enum, Color, TileState, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, TileStateToColor;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileState(extras) {
    _reporterNs.report("TileState", "./TileState", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Enum = _cc.Enum;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      TileState = _unresolved_2.TileState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "90b6echE2ZG0LfHNrOFapE8", "TileStateToColor", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("TileStateToColor", TileStateToColor = (_dec = ccclass('TileTypeToColor'), _dec2 = property({
        type: Enum(_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
          error: Error()
        }), TileState) : TileState)
      }), _dec3 = property(Color), _dec(_class = (_class2 = class TileStateToColor {
        constructor() {
          _initializerDefineProperty(this, "state", _descriptor, this);

          _initializerDefineProperty(this, "color", _descriptor2, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "state", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).empty;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "color", [_dec3], {
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
//# sourceMappingURL=9c182d3ca7211f9afb77b7a28165b778d7048c6b.js.map