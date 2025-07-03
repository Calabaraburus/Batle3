import { _decorator, Component, Label, Node } from 'cc';
import { GameContext } from '../menu/GameContext';
import { BattleController } from '../battle/BattleController';
import { LevelConfig } from './LevelManager';

const { ccclass, property } = _decorator;

@ccclass('MissionDescriptionPanel')
export class MissionDescriptionPanel extends Component {
    @property({ type: Label }) levelNameLabel: Label | null = null;
    @property({ type: Label }) objectiveLabel: Label | null = null;
    @property({ type: Label }) playerGroupLabel: Label | null = null;
    @property({ type: Label }) enemyGroupLabel: Label | null = null;
    @property({ type: Label }) playerItemsLabel: Label | null = null;
    @property({ type: Label }) enemyItemsLabel: Label | null = null;
    @property({ type: Node }) startButton: Node | null = null;

    // 🔒 Нода-блокер, перекрывающая клики
    @property({ type: Node }) blockerNode: Node | null = null;

    private config: LevelConfig | null = null;

    public setLevelInfo(config: LevelConfig) {
        this.config = config;

        const levelName = GameContext.instance.selectedLevel;
        this.levelNameLabel!.string = `${levelName}`;
        this.objectiveLabel!.string = this.getObjectiveText(config.victoryCondition?.type);

        this.playerGroupLabel!.string = `${config.playerUnits.length} (${config.playerUnits.join(', ')})`;
        this.enemyGroupLabel!.string = `${config.enemyUnits.length} (${config.enemyUnits.join(', ')})`;

        this.playerItemsLabel!.string = `${this.describeItems(config.playerItems)}`;
        this.enemyItemsLabel!.string = `${this.describeItems(config.enemyItems)}`;

        // 👁️ Активируем блокер и панель
        this.node.active = true;
        if (this.blockerNode) this.blockerNode.active = true;
    }

    private getObjectiveText(type: string): string {
        switch (type) {
            case 'eliminateAllEnemies':
                return 'Eliminate All Enemies';
            case 'killHero':
                return 'Kill Hero';
            case 'eliminateAllEnemiesInTurns':
                return 'Eliminate All Enemies In Turns';
            case 'activateCaptives':
                return 'Activate Captives';
            default:
                return 'Цель: неизвестна';
        }
    }

    private describeItems(items: Record<string, number>): string {
        const entries = Object.entries(items);
        if (entries.length === 0) return 'нет';
        return entries.map(([key, val]) => `${key} ×${val}`).join(', ');
    }

    public onStartButtonClick() {
        this.node.active = false;
        if (this.blockerNode) this.blockerNode.active = false; // 🔓 снимаем блок
        BattleController.instance.startBattle();
    }
}
