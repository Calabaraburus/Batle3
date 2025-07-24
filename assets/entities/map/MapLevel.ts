import { _decorator, Component, Node, settings } from 'cc';
import { Service } from '../services/Service';
import { SettingsLoader } from '../services/SettingsLoader';
import { MapController } from './MapController';
import { PlayerCurrentGameState } from '../services/PlayerCurrentGameState';
import { AudioConfigurator } from '../services/AudioConfigurator';
import { StartLevelWindow } from '../ui/window/StartLevelWindow';
import { GameParameters } from '../game/GameParameters';
import { ReviewCaller } from '../../scripts/review/ReviewCaller';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('MapLevel')
export class MapLevel extends Service {
    private _settingsLoader: SettingsLoader;
    private _playerState: PlayerCurrentGameState;
    private _audioConfig: AudioConfigurator;
    private _strtWnd: StartLevelWindow;

    @property(MapController)
    mapConstroller: MapController;

    @property(Node)
    configBtn: Node;

    start(): void {
        this._settingsLoader = this.getServiceOrThrow(SettingsLoader);
        this._settingsLoader.loadPlayerCurrentGameState();
        this._strtWnd = this.getServiceOrThrow(StartLevelWindow);
        this._audioConfig = AudioConfigurator.instance;
        if (this._audioConfig) {
            this._audioConfig.applyList(this._audioConfig.mapMusicList);
        } else {
            console.warn('AudioConfigurator not available!');
        }

        this.updateMap();
    }

    updateMap() {
        this._playerState = this._settingsLoader.playerCurrentGameState;

        this.configBtn.active = this._settingsLoader.gameParameters.editMode;

        this.initMap();
        this.execEvents();
    }

    execEvents() {
        if (this._playerState.eventExists('intro')) {
            this._strtWnd.showWindow(null, "scroll:intro");
            this._playerState.removeEvent('intro');

            this._settingsLoader.saveGameState();
        }

        if (this._playerState.eventExists('ending') && this._playerState.isGameFinished()) {
            this._strtWnd.showWindow(null, "scroll:ending");
            this._playerState.removeEvent('ending');

            this._settingsLoader.saveGameState();
        }

        if (this._playerState.eventExists('review') && this._playerState.getLastLvlId() == 5) {

            const reviewCaller = new ReviewCaller();

            reviewCaller.callReview();

            this._playerState.removeEvent('review');

            this._settingsLoader.saveGameState();
        }
    }



    initMap() {
        this.mapConstroller.activateAll(false);

        const fl = this._playerState.finishedLevels;

        fl.forEach(lvl => this.activateLvl(lvl));

        this.activateLvl('lvl0');

        const lids = fl.map(lvl => Number(lvl.replace('lvl', ''))).filter(id => !Number.isNaN(id));

        const maxLvlId = Math.max(...lids);
        const nextLvlId = lids.length > 0 ? maxLvlId + 1 : 1;

        const nextLvl = this.mapConstroller.getLvlObject(`lvl${nextLvlId}`);

        if (nextLvl) {
            if (!this.mapConstroller.marker.active) this.mapConstroller.marker.active = true;
            nextLvl.levelButtonNode.active = true;
            this.mapConstroller.setCurrent(nextLvl);
        } else {
            this.mapConstroller.marker.active = false;
            const mlvl = this.mapConstroller.getLvlObject(`lvl${maxLvlId}`);
            if (mlvl) this.mapConstroller.setCurrent(mlvl);
        }
    }

    activateLvl(lvlName: string) {
        this.mapConstroller.activateLvlObjectByKey(lvlName);
    }

    _countToEditMode = 0;
    tryToActivateEditMode() {
        this._countToEditMode += 1;

        if (this._countToEditMode >= 7) {
            this._countToEditMode = 0;

            if (this._settingsLoader.gameParameters.editMode == undefined) {
                var oldpars = this._settingsLoader.gameParameters;
                this._settingsLoader.removeGameParameters();
                this._settingsLoader.gameParameters.musicLevel = oldpars.musicLevel;
                this._settingsLoader.gameParameters.soundLevel = oldpars.soundLevel;
                this._settingsLoader.gameParameters.editMode = true;
            } else {
                this._settingsLoader.gameParameters.editMode = !this._settingsLoader.gameParameters.editMode;
            }

            this._settingsLoader.saveParameters();
            this.updateMap();
        }
    }

}
