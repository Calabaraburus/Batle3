import { Node, _decorator, assert, find, pseudoRandom } from "cc";
import { Service } from "../services/Service";
import { AttackSignalComponent } from "./AttackSignalComponent";
import { FieldController } from "../field/FieldController";
import { StdTileController } from "../tiles/UsualTile/StdTileController";
import { PlayerModel } from "../../models/PlayerModel";
import { CardService } from "../services/CardService";
import { TileController } from "../tiles/TileController";
import { DataService } from "../services/DataService";
const { ccclass, property } = _decorator;
@ccclass("AttackSignalController")
export class AttackSignalController extends Service {
  dataService: DataService;
  fieldController: FieldController;
  playerSide: AttackSignalComponent[] = [];
  enemySide: AttackSignalComponent[] = [];
  sides: Node[] = [];
  _enemySideIsActive = true;

  start() {
    const f = this.getService(FieldController);
    assert(f != null, "FieldController not found");
    this.fieldController = f;

    f.tilesMoveAnimationExecutes.on("tilesMoveAnimation", () => {
      this.updateData();
    }, this);

    const s = this.node.children;
    assert(s != null, "Nodes not found");
    this.sides = s;

    const t = this.getService(DataService);
    assert(t != null, "DataService not found");
    this.dataService = t;

    for (let i = 0; i < this.fieldController.fieldMatrix.cols; i++) {
      const pSignal = this.getSideComponent(i, this.sides[0]);
      if (!pSignal) return;
      this.playerSide.push(pSignal);

      const eSignal = this.getSideComponent(i, this.sides[1]);
      if (!eSignal) return;
      this.enemySide.push(eSignal);
    }
    this.playerSide;
  }

  public updateData() {
    for (
      let colNum = 0;
      colNum < this.fieldController.fieldMatrix.cols;
      colNum++
    ) {
      const startTile = this.fieldController.getStartTile(colNum);
      const endTile = this.fieldController.getEndTile(colNum);
      if (!startTile || !endTile) return;
      const pSideTile = this.fieldController.fieldMatrix.get(
        startTile?.row + 1,
        colNum
      );

      const eSideTile = this.fieldController.fieldMatrix.get(
        endTile?.row - 1,
        colNum
      );

      this.updateSignalState(
        pSideTile,
        this.playerSide[colNum],
        this.dataService.botModel
      );

      if (this._enemySideIsActive) {
        this.updateSignalState(
          eSideTile,
          this.enemySide[colNum],
          this.dataService.playerModel
        );
      }
    }
  }

  activateEnemySide(activate = true) {
    this._enemySideIsActive = activate;
  }

  atack(player = true) {
    let signals: AttackSignalComponent[];

    if (player) {
      signals = this.playerSide;
    } else {
      signals = this._enemySideIsActive ? this.enemySide : [];
    }

    signals.forEach(s => s.attack());
  }

  getSideComponent(colNum: number, side: Node) {
    const aSignalComponent = side
      .getChildByName(colNum.toString())
      ?.getComponent(AttackSignalComponent);
    if (!aSignalComponent) return;

    return aSignalComponent;
  }

  updateSignalState(
    tile: TileController,
    signalComponent: AttackSignalComponent,
    currentPlayerModel: PlayerModel
  ) {
    if (tile?.playerModel == currentPlayerModel) {
      if (signalComponent.active == false) {
        signalComponent.show();
        signalComponent.active = true;
      }
    } else if (signalComponent.active == true) {
      signalComponent.hide();
      signalComponent.active = false;
    }
  }
}
