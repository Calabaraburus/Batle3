System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, CCInteger, CCFloat, TextAsset, Button, TileModel, MnemonicMapping, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _crd, ccclass, property, FieldModel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileModel(extras) {
    _reporterNs.report("TileModel", "./TileModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMnemonicMapping(extras) {
    _reporterNs.report("MnemonicMapping", "./MnemonicMapping", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      CCInteger = _cc.CCInteger;
      CCFloat = _cc.CCFloat;
      TextAsset = _cc.TextAsset;
      Button = _cc.Button;
    }, function (_unresolved_2) {
      TileModel = _unresolved_2.TileModel;
    }, function (_unresolved_3) {
      MnemonicMapping = _unresolved_3.MnemonicMapping;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "792948nAOpFTpQMJv+xveOC", "FieldModel", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Represents game field model
       */

      _export("FieldModel", FieldModel = (_dec = ccclass('FieldModel'), _dec2 = property({
        type: CCInteger
      }), _dec3 = property({
        type: CCInteger
      }), _dec4 = property({
        type: CCFloat
      }), _dec5 = property({
        type: CCInteger
      }), _dec6 = property({
        type: CCInteger
      }), _dec7 = property({
        type: CCInteger
      }), _dec8 = property({
        type: [_crd && TileModel === void 0 ? (_reportPossibleCrUseOfTileModel({
          error: Error()
        }), TileModel) : TileModel],
        visible: true,
        tooltip: "Tile models"
      }), _dec9 = property({
        type: [TextAsset],
        visible: true,
        tooltip: "Field map"
      }), _dec10 = property({
        type: [_crd && MnemonicMapping === void 0 ? (_reportPossibleCrUseOfMnemonicMapping({
          error: Error()
        }), MnemonicMapping) : MnemonicMapping],
        visible: true,
        tooltip: "Tile mnemonic mapping"
      }), _dec(_class = (_class2 = class FieldModel extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "cols", _descriptor, this);

          _initializerDefineProperty(this, "rows", _descriptor2, this);

          _initializerDefineProperty(this, "border", _descriptor3, this);

          _initializerDefineProperty(this, "quantityToRocket", _descriptor4, this);

          _initializerDefineProperty(this, "quantityToBomb", _descriptor5, this);

          _initializerDefineProperty(this, "quantityToStar", _descriptor6, this);

          _initializerDefineProperty(this, "tiles", _descriptor7, this);

          _initializerDefineProperty(this, "fieldMap", _descriptor8, this);

          _initializerDefineProperty(this, "mnemMapping", _descriptor9, this);
        }

        /**
         * Get standart tile models
         * @returns collection of std tile models
         */
        getStandartTiles() {
          return this.tiles.filter(item => !item.specialTile);
        }
        /**
         * Gets tile model by type name
         * @param typeName Type name
         * @returns Tile model
         */


        getTileModel(typeName) {
          return this.tiles.filter(item => item.tileName == typeName)[0];
        }
        /**
        * Gets tile model by mapmnemonic
        * @param mnemonic Type name
        * @returns Tile model
        */


        getTileModelByMapMnemonic(mnemonic) {
          let map = this.mnemMapping.filter(item => item.mnemonic == mnemonic);

          if (map.length == 0) {
            return this.tiles.filter(item => item.tileName == mnemonic)[0];
          }

          Button;
          let res = this.tiles.filter(item => item.tileName == map[0].tileName);
          return res.length != 0 ? res[0] : this.tiles[0];
        }

        getFieldMap() {
          let result = [];
          const textLines = this.fieldMap.text.split(/\r?\n/);
          textLines.forEach((line, i) => {
            let iinv = textLines.length - i - 1;
            result[iinv] = [];

            for (let j = 0; j < line.length; j++) {
              result[iinv][j] = line.charAt(j);
            }
          });
          return result;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "cols", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 15;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "rows", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 15;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "border", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "quantityToRocket", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "quantityToBomb", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 8;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "quantityToStar", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 11;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "tiles", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "fieldMap", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "mnemMapping", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d9c8349ba08c921a880d58e7acf7b4c7814f9583.js.map