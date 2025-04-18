System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, instantiate, Node, TileContollerListItem, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, TileCreator;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfFieldModel(extras) {
    _reporterNs.report("FieldModel", "../../models/FieldModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileContollerListItem(extras) {
    _reporterNs.report("TileContollerListItem", "./TileContollerListItem", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      instantiate = _cc.instantiate;
      Node = _cc.Node;
    }, function (_unresolved_2) {
      TileContollerListItem = _unresolved_2.TileContollerListItem;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cc315NJHVBPD6s1Xie2NueX", "TileCreator", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * This class is need to build tiles of different types (prefabs)
       */

      _export("TileCreator", TileCreator = (_dec = ccclass('TileCreator'), _dec2 = property(_crd && TileContollerListItem === void 0 ? (_reportPossibleCrUseOfTileContollerListItem({
        error: Error()
      }), TileContollerListItem) : TileContollerListItem), _dec(_class = (_class2 = class TileCreator extends Component {
        constructor(...args) {
          super(...args);
          this._fieldModel = void 0;

          _initializerDefineProperty(this, "tilePrefabs", _descriptor, this);
        }

        setModel(fieldModel) {
          this._fieldModel = fieldModel;
        }

        create(name) {
          let prefabs = this.tilePrefabs.filter(t => {
            let names = t.name.split(';');
            let haveResult = false;
            names.forEach(n => {
              if (n.trim() == name) {
                haveResult = true;
                return;
              }
            });

            if (haveResult) {
              return true;
            }

            return false;
          });

          if (prefabs.length > 0) {
            return instantiate(prefabs[0].prefab);
          } else {
            return null;
          }

          return new Node();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tilePrefabs", [_dec2], {
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
//# sourceMappingURL=501f95505563c6d8badf18ae709787e8639434ce.js.map