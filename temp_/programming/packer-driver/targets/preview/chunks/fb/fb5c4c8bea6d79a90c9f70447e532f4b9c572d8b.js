System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Sprite, TileController, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, StarTileController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileModel(extras) {
    _reporterNs.report("TileModel", "../../../models/TileModel", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Sprite = _cc.Sprite;
    }, function (_unresolved_2) {
      TileController = _unresolved_2.TileController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "80ae3niNVhJ3bJAiVo2eoAC", "StarTileController", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("StarTileController", StarTileController = (_dec = ccclass('StarTileController'), _dec2 = property(Sprite), _dec(_class = (_class2 = class StarTileController extends (_crd && TileController === void 0 ? (_reportPossibleCrUseOfTileController({
        error: Error()
      }), TileController) : TileController) {
        constructor() {
          super(...arguments);
          this._modelCF = void 0;

          _initializerDefineProperty(this, "starSprite", _descriptor, this);
        }

        get modelCreatedFrom() {
          return this._modelCF;
        }

        createdForm(model) {
          this._modelCF = model;
          this.starSprite.color = model.starColor;
        }

        destroyTile() {
          super.destroyTile();
          this.starSprite.spriteFrame = null;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "starSprite", [_dec2], {
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
//# sourceMappingURL=fb5c4c8bea6d79a90c9f70447e532f4b9c572d8b.js.map