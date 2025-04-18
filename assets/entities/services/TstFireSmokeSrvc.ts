import { Vec2, Vec3, _decorator, log, randomRangeInt, tween } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { ReadonlyMatrix2D } from "../field/ReadonlyMatrix2D";
import { TileController } from "../tiles/TileController";
import { StdTileController } from "../tiles/UsualTile/StdTileController";
import { DataService } from "./DataService";
import { Service } from "./Service";
import { CardService } from "./CardService";
import { EffectsService } from "./EffectsService";
import { GameManager } from "../game/GameManager";
import { ShootEffect } from "../effects/ShootEffect";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { Line } from "../effects/Line";
import { CardEffect } from "../effects/CardEffect";
import { ShootSmokeEffect } from "../effects/shootSmokeEffect";
const { ccclass } = _decorator;

@ccclass("TstFireSmokeSrvc")
export class TstFireSmokeSrvc extends Service {
  private _dataService: DataService | null;
  private _shootEffect: ShootEffect | null;
  private _gameManager: GameManager | null;
  private _cache: ObjectsCache | null;
  private _effectsService: EffectsService | null;
  private _cardService: CardService | null;

  start() {
    this._dataService = this.getService(DataService);
    this._cardService = this.getService(CardService);
    this._effectsService = this.getService(EffectsService);
    this._cache = ObjectsCache.instance;
    this._gameManager = this.getService(GameManager);
    this._shootEffect = this.getService(ShootEffect);

    this.schedule(() => {
      const field = this._dataService?.field;
      if (field != null) {
        this.playEffect(
          field.fieldMatrix.get(
            randomRangeInt(0, field.fieldMatrix.rows),
            randomRangeInt(0, field.fieldMatrix.cols)
          ),
          field.fieldMatrix.get(
            randomRangeInt(0, field.fieldMatrix.rows),
            randomRangeInt(0, field.fieldMatrix.cols)
          )
        );
      }
    }, 1);
  }

  playEffect(t1: TileController, t2: TileController) {
    console.log("fire wall effect");

    this._shootEffect?.makeShoots([
      new Line(
        new Vec2(t1.node.position.x, t1.node.position.y),
        new Vec2(t2.node.position.x, t2.node.position.y)
      ),
    ]);

    const timeObj = { time: 0 };
    const animator = tween(timeObj);

    const effects: CardEffect[] = [];

    const smokeEffect = this._cache?.getObjectByName<ShootSmokeEffect>("ShootSmokeEffect");

    if (smokeEffect == null) {
      return;
    }

    let dir: Vec3 = new Vec3();
    dir = Vec3.subtract(dir, t1.node.position, t2.node.position);
    //= Vec2.signAngle(dir.normalize(), Vec3.UP);
    const vec: Vec2 = new Vec2(dir.x, dir.y).normalize();
    const angle = vec.signAngle(new Vec2(1, 0));
    smokeEffect.rotate(-(angle - Math.PI / 2));

    log(-angle * (180 / Math.PI));

    smokeEffect.node.parent =
      this._effectsService != null ? this._effectsService?.effectsNode : null;

    smokeEffect.node.position = Vec3.lerp(
      smokeEffect.node.position,
      t1.node.position,
      t2.node.position,
      0.5
    );
    smokeEffect.stopEmmit();
    smokeEffect.stop();
    smokeEffect.play();
    effects.push(smokeEffect);

    animator
      .delay(1)
      .call(() => effects.forEach((e) => e.cacheDestroy()))
      .start();

    return true;
  }
}
