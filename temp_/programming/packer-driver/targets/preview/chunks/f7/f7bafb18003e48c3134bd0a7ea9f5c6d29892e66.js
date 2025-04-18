System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, SpriteFrame, CCInteger, Color, AdditionalSprite, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, TileModel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfAdditionalSprite(extras) {
    _reporterNs.report("AdditionalSprite", "./AdittionalSprite", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      SpriteFrame = _cc.SpriteFrame;
      CCInteger = _cc.CCInteger;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      AdditionalSprite = _unresolved_2.AdittionalSprite;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5fa47lPAh1CwbBunE+2EH8i", "TileModel", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Represents tile model
       */

      _export("TileModel", TileModel = (_dec = ccclass('TileModel'), _dec2 = property({
        type: CCInteger,
        visible: true
      }), _dec3 = property({
        visible: true
      }), _dec4 = property({
        type: SpriteFrame,
        visible: true
      }), _dec5 = property({
        visible: true
      }), _dec6 = property({
        visible: true
      }), _dec7 = property({
        type: _crd && AdditionalSprite === void 0 ? (_reportPossibleCrUseOfAdditionalSprite({
          error: Error()
        }), AdditionalSprite) : AdditionalSprite,
        visible: true
      }), _dec(_class = (_class2 = class TileModel extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "tileId", _descriptor, this);

          _initializerDefineProperty(this, "tileName", _descriptor2, this);

          _initializerDefineProperty(this, "sprite", _descriptor3, this);

          _initializerDefineProperty(this, "starColor", _descriptor4, this);

          _initializerDefineProperty(this, "specialTile", _descriptor5, this);

          _initializerDefineProperty(this, "additionalSprites", _descriptor6, this);
        }

        findAdditionalSprite(name) {
          var res = this.additionalSprites.filter(item => item.name == name);

          if (res.length != 0) {
            return res[0].sprite;
          } else {
            return null;
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tileId", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tileName", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return "";
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "sprite", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "starColor", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return new Color();
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "specialTile", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "additionalSprites", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f7bafb18003e48c3134bd0a7ea9f5c6d29892e66.js.map