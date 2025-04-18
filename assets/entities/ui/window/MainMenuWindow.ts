import {
    _decorator,
} from 'cc';
import { Service } from '../../services/Service';
import { SettingsLoader } from '../../services/SettingsLoader';
import { MapLevel } from '../../map/MapLevel';
const { ccclass, property } = _decorator;

@ccclass('MainMenuWindow')
export class MainMenuWindow extends Service {
    private _settingsLoader: SettingsLoader;
    private _map: MapLevel;

    protected start(): void {
        this._settingsLoader = this.getServiceOrThrow(SettingsLoader);
        this._map = this.getServiceOrThrow(MapLevel);
    }

    public GameReset() {
        this._settingsLoader.removeConfiguration();
        this._settingsLoader.removePlayerCurrentGameState();
        this._settingsLoader.loadPlayerCurrentGameState();
        this._settingsLoader.loadPlayerCurrentGameState();

        this._map.updateMap();
    }
}
