System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, log, EventTarget, Button, Vec3, CCFloat, TileModel, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, TileController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfTileModel(extras) {
    _reporterNs.report("TileModel", "../../models/TileModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFieldController(extras) {
    _reporterNs.report("FieldController", "../field/FieldController", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      log = _cc.log;
      EventTarget = _cc.EventTarget;
      Button = _cc.Button;
      Vec3 = _cc.Vec3;
      CCFloat = _cc.CCFloat;
    }, function (_unresolved_2) {
      TileModel = _unresolved_2.TileModel;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3a156jmaexMQKRQX+ethx4f", "TileController", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("TileController", TileController = (_dec = ccclass('TileController'), _dec2 = property(_crd && TileModel === void 0 ? (_reportPossibleCrUseOfTileModel({
        error: Error()
      }), TileModel) : TileModel), _dec3 = property(CCFloat), _dec4 = property(CCFloat), _dec(_class = (_class2 = class TileController extends Component {
        constructor() {
          super(...arguments);
          this._field = void 0;
          this._button = void 0;
          this._needMove = false;
          this._from = void 0;
          this._to = void 0;
          this._speed = void 0;
          this._interactable = true;
          this.clickedEvent = new EventTarget();

          _initializerDefineProperty(this, "tileModel", _descriptor, this);

          _initializerDefineProperty(this, "Speed", _descriptor2, this);

          _initializerDefineProperty(this, "Acceleration", _descriptor3, this);

          this.tileAnalized = void 0;
          this._isDestroied = false;
          this._activating = false;
          this._justCreated = false;
          this._col = 0;
          this._row = 0;
        }

        get isDestroied() {
          return this._isDestroied;
        }

        get activating() {
          return this._activating;
        }

        get tileTypeId() {
          return this.tileModel.tileId;
        }

        get justCreated() {
          return this._justCreated;
        }

        set justCreated(value) {
          this._justCreated = value;
        }

        get col() {
          return this._col;
        }

        set col(value) {
          this._col = value;
        }

        get row() {
          return this._row;
        }

        set row(value) {
          this._row = value;
        }

        start() {
          this._button = this.getComponent(Button);
        }

        setModel(tileModel) {
          if (tileModel == null) {
            log("[tile] tile model can't be null");
            return;
          }

          this.tileModel = tileModel;

          if (tileModel.tileName == "start" || tileModel.tileName == "end" || tileModel.tileName == "empty") {
            this._button = this.getComponent(Button);
            this._interactable = false;
            this._button.interactable = this._interactable;
          }
        }

        setField(field) {
          this._field = field;
        }
        /**
         * Method called when Tile pressed
         * @returns void
         */


        clicked() {
          this.activate();
        }

        destroyTile() {
          this._isDestroied = true;
        }

        activate() {
          if (this.activating || this._justCreated || !this._interactable || this.isDestroied) {
            return;
          }

          this._activating = true;
          this.OnClicked();
          this._activating = false;
        }

        OnClicked() {
          this.clickedEvent.emit("TileController", this);
        }

        update(deltaTime) {
          if (this._needMove) {
            var dir = new Vec3();
            Vec3.subtract(dir, this._to, this._from);
            dir.normalize();
            this._speed += this.Acceleration * deltaTime;

            if (this._speed > this.Speed) {
              this._speed = this.Speed;
            }

            var speed3D = new Vec3();
            var pos = new Vec3();
            var dir2 = new Vec3();
            Vec3.multiplyScalar(speed3D, dir, this._speed * deltaTime);
            Vec3.add(pos, this.node.position, speed3D);
            Vec3.subtract(dir2, this._to, pos);
            dir2.normalize();

            if (!dir.equals(dir2)) {
              this._needMove = false;
              pos = this._to;
            }

            this.node.position = pos;
          }
        }

        move(from, to) {
          this._from = from;
          this._to = to;
          this._speed = 0;
          if (!this._to.equals(this._from)) this._needMove = true;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tileModel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: null
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "Speed", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "Acceleration", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0.1;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2e37a7b0e9fc68ea091f25f6873abfb99024c2ff.js.map