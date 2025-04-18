System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Sprite, Vec3, instantiate, Prefab, UITransform, TileController, TileState, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, StdTileController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileController(extras) {
    _reporterNs.report("TileController", "../TileController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileModel(extras) {
    _reporterNs.report("TileModel", "../../../models/TileModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileState(extras) {
    _reporterNs.report("TileState", "../TileState", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Sprite = _cc.Sprite;
      Vec3 = _cc.Vec3;
      instantiate = _cc.instantiate;
      Prefab = _cc.Prefab;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      TileController = _unresolved_2.TileController;
    }, function (_unresolved_3) {
      TileState = _unresolved_3.TileState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ca3d7tZX4xK/LGI64SbtiRi", "StdTileController", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("StdTileController", StdTileController = (_dec = ccclass('StdTileController'), _dec2 = property(Sprite), _dec3 = property(Prefab), _dec(_class = (_class2 = class StdTileController extends (_crd && TileController === void 0 ? (_reportPossibleCrUseOfTileController({
        error: Error()
      }), TileController) : TileController) {
        constructor() {
          super(...arguments);
          this._curSprite = void 0;
          this._state = void 0;
          this._bombSprite = void 0;
          this._rocketSprite = void 0;
          this._starSprite = void 0;

          _initializerDefineProperty(this, "SpecialSprite", _descriptor, this);

          _initializerDefineProperty(this, "destroyPartycles", _descriptor2, this);
        }

        start() {
          super.start();
          this.updateSprite();
        }

        updateSprite() {
          this._curSprite = this.getComponent(Sprite);
          this._curSprite.spriteFrame = this.tileModel.sprite;
        }

        get state() {
          return this._state;
        }

        setBomb() {
          this.SpecialSprite.spriteFrame = this._bombSprite;
          this._state = (_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).bomb;
        }

        setRocket() {
          this.SpecialSprite.spriteFrame = this._rocketSprite;
          this._state = (_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).rocket;
        }

        setStar() {
          this.SpecialSprite.spriteFrame = this._starSprite;
          this._state = (_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).star;
        }

        resetSpecialSprite() {
          this.SpecialSprite.spriteFrame = null;
          this._state = (_crd && TileState === void 0 ? (_reportPossibleCrUseOfTileState({
            error: Error()
          }), TileState) : TileState).empty;
        }

        setModel(tileModel) {
          super.setModel(tileModel);
          this._rocketSprite = tileModel.findAdditionalSprite("rocket");
          this._bombSprite = tileModel.findAdditionalSprite("bomb");
          this._starSprite = tileModel.findAdditionalSprite("star");
        }

        destroyTile() {
          super.destroyTile();
          this._curSprite = this.getComponent(Sprite);
          this._curSprite.spriteFrame = null;
          this.CreateParticles();
          this.resetSpecialSprite();
        }

        CreateParticles() {
          var ps = instantiate(this.destroyPartycles); //.getComponent(ParticleSystem2D);

          ps.parent = this.node.parent;
          var ui = this.getComponent(UITransform);
          ps.position = new Vec3(this.node.position.x + ui.contentSize.width / 2, this.node.position.y + ui.contentSize.height / 2, this.node.position.z);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "SpecialSprite", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "destroyPartycles", [_dec3], {
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
//# sourceMappingURL=0808f0cb4240b583e6b0b4db934e7e2efc2f0541.js.map