import { _decorator, assert, CCString, Component, EditBox, Node } from "cc";
import { Service } from "../services/Service";
import { SettingsLoader } from "../services/SettingsLoader";
import { Grid } from "../ui/GridView/Grid";
import { LvlConfigGridRow } from "../ui/GridView/LvlConfigGridRow";
import { SceneLoaderService } from "../services/SceneLoaderService";
import { load } from "../../../extensions/i18n/src/scene";
const { ccclass, property } = _decorator;

@ccclass("GameConfigurator")
export class GameConfigurator extends Service {
    private _settingsLoader: SettingsLoader;

    @property(Grid)
    grid: Grid;

    @property(Node)
    editNode: Node;

    private editBox: EditBox;

    start() {
        this._settingsLoader = this.getServiceOrThrow(SettingsLoader);
        const t = this.editNode.getComponentInChildren(EditBox);
        assert(t != null);

        this.editBox = t;

        this.fillGrid();
    }

    reset() {
        this._settingsLoader.removeConfiguration();
        this._settingsLoader.removePlayerCurrentGameState();
        this.fillGrid();
    }

    fillGrid() {
        const config = this._settingsLoader.gameConfiguration;

        this.grid.rowCount = config.levels.length;
        this.grid.updateGrid();

        config.levels.forEach((v, i) => {

            const cfgRow = this.grid.rows[i].getComponent(LvlConfigGridRow);

            if (cfgRow) {
                cfgRow.lvlCfgRow = v;
            }
        });
    }

    public addRow() {
        this.grid.rowCount += 1;
        this.grid.updateGrid();
    }

    public showEdit() {
        this.editNode.active = true;
        this.editBox.string = "Parameters:\n" + this._settingsLoader.getParametersJson();
        this.editBox.string += "\n\nState:\n" + this._settingsLoader.getPlayerCurrentGameStateJson();
        this.editBox.string += "\n\nGameConfiguration:\n" + this._settingsLoader.getGameConfigurationJson();
    }

    goToMain() {
        const loader = this.getServiceOrThrow(SceneLoaderService);
        loader.loadLevel("LvlScene");
    }


    save() {
        const cfg = this._settingsLoader.gameConfiguration;
        cfg.levels = [];

        this.grid.rows.forEach(r => {
            const cfgRow = r.getComponent(LvlConfigGridRow);

            if (cfgRow) {
                cfg.levels.push(cfgRow.lvlCfgRow);
            }
        });

        this._settingsLoader.saveConfiguration();
    }
}
