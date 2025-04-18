//  gameManager.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras
/*
import { Component, debug, _decorator } from "cc";
// import { Bot } from "../../bot/Bot";
// import { IBot } from "../../bot/IBot";
import { LevelController } from "../level/LevelController";
import { createMachine, interpret } from "xstate";
import { FieldController } from "../field/FieldController";
import { FieldAnalizer } from "../field/FieldAnalizer";
const { ccclass, property } = _decorator;

@ccclass("GameManager_c")
export class GameManager extends Component {
  @property({ type: LevelController })
  levelController: LevelController;

  // @property({ type: Bot })
  // bot: IBot;

  private _field: FieldController;
  private _fieldAnalizer: FieldAnalizer;

  private readonly blustGameStateMachine = createMachine(
    {
      tsTypes: {} as import("./GameStateMachine.typegen").Typegen0,
      id: "BlustGameStateMachine",
      initial: "Init",
      states: {
        Init: {
          entry: "initGame",
          on: {
            GameStartEvent: {
              target: "PlayerTurn",
            },
          },
        },
        PlayerTurn: {
          entry: "startPlayerTurn",
          on: {
            EndTurnEvent: {
              target: "PlayerEndTurn",
            },
          },
        },
        PlayerEndTurn: {
          entry: "endTurn",
          on: {
            EndGameEvent: {
              target: "PlayerWin",
            },
            StartTurnEvent: {
              target: "BotTurn",
            },
          },
        },
        PlayerWin: {
          type: "final",
          entry: "playerWin",
        },
        BotTurn: {
          entry: "startBotTurn",
          on: {
            EndGameEvent: {
              target: "PlayerLose",
            },
            EndTurnEvent: {
              target: "BotEndTurn",
            },
          },
        },
        PlayerLose: {
          type: "final",
          entry: "playerLose",
        },
        BotEndTurn: {
          entry: "endTurn",
          on: {
            StartTurnEvent: {
              target: "PlayerTurn",
            },
          },
        },
      },
    },
    {
      actions: {
        // action implementations
        initGame: this.initGame,
        startPlayerTurn: this.startPlayerTurn,
        endTurn: this.endTurn,
        startBotTurn: this.startBotTurn,
        playerWin: this.playerWin,
        playerLose: this.playerLose,
      },
    }
  );

  readonly toggleService = interpret(this.blustGameStateMachine);

  start() {
    this._field = this.levelController.fieldController;
    this._fieldAnalizer = new FieldAnalizer(this._field);

    this.toggleService.start();
  }

  initGame() {
    this._field.tileClickedEvent.on("FieldController", this.tileClicked, this);
    this._field.generateTiles();
    const analizedData = this._fieldAnalizer.analize();
    this._field.setTilesSpeciality(analizedData);
    this._field.fixTiles(analizedData);

    this.toggleService.send("PlayerTurn");
  }

  startPlayerTurn(): void {
    debug("");
  }

  private tileClicked(): void {
    debug("");
  }

  endTurn() {
    debug("");
  }

  startBotTurn() {
    debug("");
  }

  playerWin() {
    debug("");
  }

  playerLose() {
    debug("");
  }
}
*/
export const a = 1;
