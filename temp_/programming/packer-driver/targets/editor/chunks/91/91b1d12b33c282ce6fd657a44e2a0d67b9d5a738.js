System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Component, _decorator, LevelModel, LevelView, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, LevelController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfLevelModel(extras) {
    _reporterNs.report("LevelModel", "../../models/LevelModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLevelView(extras) {
    _reporterNs.report("LevelView", "./LevelView", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      Component = _cc.Component;
      _decorator = _cc._decorator;
    }, function (_unresolved_2) {
      LevelModel = _unresolved_2.LevelModel;
    }, function (_unresolved_3) {
      LevelView = _unresolved_3.LevelView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4e89971ZhZPiZG2docImXis", "LevelController", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("LevelController", LevelController = (_dec = ccclass('LevelController'), _dec2 = property({
        type: _crd && LevelView === void 0 ? (_reportPossibleCrUseOfLevelView({
          error: Error()
        }), LevelView) : LevelView
      }), _dec3 = property({
        type: _crd && LevelModel === void 0 ? (_reportPossibleCrUseOfLevelModel({
          error: Error()
        }), LevelModel) : LevelModel
      }), _dec(_class = (_class2 = class LevelController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "view", _descriptor, this);

          _initializerDefineProperty(this, "model", _descriptor2, this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "view", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "model", [_dec3], {
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
//# sourceMappingURL=91b1d12b33c282ce6fd657a44e2a0d67b9d5a738.js.map