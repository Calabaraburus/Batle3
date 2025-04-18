import { PlayerModel } from "../../models/PlayerModel";
import { EnemyFieldController } from "../enemyField/EnemyFieldController";
import { FieldAnalyzer } from "../field/FieldAnalizer";
import { FieldController } from "../field/FieldController";
import { GameManager } from "../game/GameManager";
import { LevelController } from "../level/LevelController";
import { PlayerFieldController } from "../playerField/PlayerFieldController";
import { DebugView } from "../ui/debugger/DebugView";
import { LevelConfiguration } from "../configuration/LevelConfiguration";
import { ITileFieldController } from "../field/ITileFieldController";

export interface IDataService {
  get levelConfiguration(): LevelConfiguration;

  get debugView(): DebugView;

  get levelController(): LevelController;

  get fieldAnalizer(): FieldAnalyzer;

  get botModel(): PlayerModel;

  get playerModel(): PlayerModel;

  get playerFieldController(): PlayerFieldController;

  get enemyFieldController(): EnemyFieldController;

  get field(): ITileFieldController;
}
