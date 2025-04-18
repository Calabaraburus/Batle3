System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Node, CCInteger, TileController, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, BombTileController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Node = _cc.Node;
      CCInteger = _cc.CCInteger;
    }, function (_unresolved_2) {
      TileController = _unresolved_2.TileController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "fdc3f23KSJGcJ57sAOpl67k", "BombTileController", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("BombTileController", BombTileController = (_dec = ccclass('BombTileController'), _dec2 = property(Node), _dec3 = property(CCInteger), _dec(_class = (_class2 = class BombTileController extends (_crd && TileController === void 0 ? (_reportPossibleCrUseOfTileController({
        error: Error()
      }), TileController) : TileController) {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "bombSpriteNode", _descriptor, this);

          _initializerDefineProperty(this, "fireDistance", _descriptor2, this);
        }

        destroyTile() {
          super.destroyTile();
          this.bombSpriteNode.active = false;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "bombSpriteNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fireDistance", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8a6b55ef09f786c15ed61d0042c6d5a12852e2dd.js.map