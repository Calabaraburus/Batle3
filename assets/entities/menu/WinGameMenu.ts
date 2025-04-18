import { _decorator, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("WinGameMenu")
export class WinGameMenu extends Component {
  updateStatistic(playerStat: any = {}, enemyStat: any = {}) {
    const playerAll = this.node
      .getChildByPath("PlayerStatistic/AllTileNumber")
      ?.getComponent(Label);
    const playerSword = this.node
      .getChildByPath("PlayerStatistic/Sword/SwordNumber")
      ?.getComponent(Label);
    const playerBow = this.node
      .getChildByPath("PlayerStatistic/Bow/BowNumber")
      ?.getComponent(Label);
    const playerShield = this.node
      .getChildByPath("PlayerStatistic/Shield/ShieldNumber")
      ?.getComponent(Label);

    if (!playerAll || !playerSword || !playerBow || !playerShield) return;

    playerAll.string = enemyStat.tilesNumber.toString();
    playerSword.string = enemyStat.swordNumber.toString();
    playerBow.string = enemyStat.bowNumber.toString();
    playerShield.string = enemyStat.shieldNumber.toString();

    const enemyAll = this.node
      .getChildByPath("EnemyStatistic/AllTileNumber")
      ?.getComponent(Label);
    const enemySword = this.node
      .getChildByPath("EnemyStatistic/Sword/SwordNumber")
      ?.getComponent(Label);
    const enemyBow = this.node
      .getChildByPath("EnemyStatistic/Bow/BowNumber")
      ?.getComponent(Label);
    const enemyShield = this.node
      .getChildByPath("EnemyStatistic/Shield/ShieldNumber")
      ?.getComponent(Label);

    if (!enemyAll || !enemySword || !enemyBow || !enemyShield) return;

    enemyAll.string = playerStat.tilesNumber.toString();
    enemySword.string = playerStat.swordNumber.toString();
    enemyBow.string = playerStat.bowNumber.toString();
    enemyShield.string = playerStat.shieldNumber.toString();
  }
}
