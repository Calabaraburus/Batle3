import { _decorator, Component, js, Node, director, game, __private } from "cc";
import { PlayerModel } from "../../models/PlayerModel";
import { helpers } from "../../scripts/helpers";
import { FieldController } from "../field/FieldController";
import { DebugView } from "../ui/debugger/DebugView";
import { Behaviour } from "./Behaviour";
import { Service } from "../services/Service";
import { ObjectsCache } from "../../ObjectsCache/ObjectsCache";
import { CardService } from "../services/CardService";
import { DataService } from "../services/DataService";
import { LevelModel } from "../../models/LevelModel";
import { GameBehaviour } from "./GameBehaviour";
import { GameState } from "../game/GameState";
import { EffectsService } from "../services/EffectsService";
import { EffectsManager } from "../game/EffectsManager";
import { AudioManagerService } from "../../soundsPlayer/AudioManagerService";
import { GameManager } from "../game/GameManager";
import { EOTInvoker } from "../game/EOTInvoker";
const { ccclass, property } = _decorator;

@ccclass("BehaviourSelector")
export class BehaviourSelector extends Service {
  private _behavioursDictionary: Map<string, Behaviour[]> = new Map<
    string,
    Behaviour[]
  >();
  private _curBehaviours: Behaviour[] = [];
  private _debug: DebugView | null | undefined;
  private _objectCache: ObjectsCache;
  private _cardService: CardService;
  private _dataService: DataService;
  private _levelModel: LevelModel;
  private _gameState: GameState;
  private _effectsService: EffectsService;
  private _effectsManager: EffectsManager;
  private _audioManager: AudioManagerService;
  private _eotInvoker: EOTInvoker;

  public get gameState() { return this._gameState; }

  public get dataService() { return this._dataService; }

  start() {
    //this._debug = this.getServiceOrThrow(DebugView);
    this.fillBehavDict(this.getComponentsInChildren(Behaviour));
    this.Setup(this._objectCache,
      this._cardService,
      this._dataService,
      this._levelModel,
      this._gameState,
      this._effectsService,
      this._effectsManager,
      this._audioManager,
      this._eotInvoker);
  }

  public Setup(objectsCache: ObjectsCache,
    cardService: CardService,
    dataService: DataService,
    levelModel: LevelModel,
    gameState: GameState,
    effectsService: EffectsService,
    effectsManager: EffectsManager,
    audioManager: AudioManagerService,
    eotInvoker: EOTInvoker) {

    this._objectCache = objectsCache;
    this._cardService = cardService;
    this._dataService = dataService;
    this._levelModel = levelModel;
    this._gameState = gameState;
    this._effectsService = effectsService;
    this._effectsManager = effectsManager;
    this._audioManager = audioManager;
    this._eotInvoker = eotInvoker;

    this._debug = this._dataService.debugView;

    this._behavioursDictionary.forEach(bd => bd.forEach(b => {
      if (b instanceof GameBehaviour) {
        b.Setup(objectsCache,
          cardService,
          dataService,
          levelModel,
          gameState,
          effectsService,
          effectsManager,
          audioManager,
          eotInvoker);
      }
    }));
  }

  public hasBehavioursInProccess(): boolean {
    let has = false;
    this._behavioursDictionary.forEach((val) => {
      if (has) return;
      val.forEach((b) => {
        if (b.inProcess) {
          has = true;
          return;
        }
      });
    });

    return has;
  }

  fillBehavDict(behavs: Behaviour[]): void {
    this._debug?.log("[behaviour][selector] start fill bihave dicts");

    behavs.forEach((b) => {
      if (!this._behavioursDictionary.has(b.type)) {
        this._behavioursDictionary.set(b.type, []);
        this._debug?.log(`[behaviour][selector] selector set '${b.type}'`);
      }

      const list = this._behavioursDictionary.get(b.type);
      list?.push(b);

      this._debug?.log(`[behaviour][selector] selector push '${b.type}'`);
    });
  }

  getBehaviour<T extends Behaviour>(
    classConstructor: __private._types_globals__Constructor<T>
  ): T | null {
    for (const behaveGroup of this._behavioursDictionary.values()) {
      for (const behave of behaveGroup) {
        if (behave instanceof classConstructor) {
          return behave as T | null;
        };
      }
    }
    return null;
  }

  run(target: Component) {
    this._debug?.log(`[behaviour][selector] selector run`);

    if (this._curBehaviours.length <= 0) {
      this._curBehaviours = this.select(target);
    }

    if (this._curBehaviours.length > 0) {
      this._debug?.log(`[behaviour][selector] start iterate over behaves`);

      // run all behaviours for given target
      const stopedBehaves: Behaviour[] = [];
      this._curBehaviours.forEach((b) => {
        try {
          b.target = target;
          if (b.isStoped) {
            b.activate();
          }
          this._debug?.log(
            `[behaviour][selector]Try run behaviour ${b.serviceType}`
          );
          b.run();

          if (b.isStoped) {
            stopedBehaves.push(b);
          }
        } catch (error) {
          if (error instanceof Error) {
            this._debug?.log(`[behaviour][selector] Error ${error.message}`);
          }
        }
      });

      this._debug?.log(`[behaviour][selector] stop iterate over behaves`);

      this._debug?.log(`[behaviour][selector] clear stoped behaves`);

      // remove stoped behaves
      stopedBehaves.forEach((b) => {
        const index = this._curBehaviours.indexOf(b, 0);
        if (index > -1) {
          this._curBehaviours.splice(index, 1);
        }
      });
    }
  }

  public hasActiveBehaviours() {
    return this._curBehaviours.length > 0;
  }

  select(target: Component): Behaviour[] {
    this._debug?.log(`[behaviour][selector] select behaves for target`);

    const type = js.getClassName(target);

    this._debug?.log(`[behaviour][selector] target type: '${type}'`);

    const result: Behaviour[] = [];
    if (this._behavioursDictionary.has(type)) {
      const list = this._behavioursDictionary.get(type);
      list?.forEach((b) => {
        b.target = target;
        if (b.activateCondition()) {
          this._debug?.log(
            `[behaviour][selector] target pass condition of behave '${b.type}'`
          );
          result.push(b);
        }
      });
    }

    return result;
  }

  clone(): BehaviourSelector {
    const newSelector = new BehaviourSelector();

    newSelector.fillBehavDict(this.getComponentsInChildren(Behaviour).map(b => b.clone()));

    return newSelector;
  }
}
