import { log, native } from 'cc';
import { AppMetricaCaller } from './AppMetricaCaller';
import { FirebaseCaller } from './FirebaseCaller';

export class Analitics {

    private _appMetrikaCaller: AppMetricaCaller;
    private _firebaseCaller: FirebaseCaller;

    constructor() {
        this._appMetrikaCaller = new AppMetricaCaller();
        this._firebaseCaller = new FirebaseCaller();
    }

    public startLevel(level: string) {
        this._appMetrikaCaller.startLevel(level);
        this._firebaseCaller.startLevel(level);
    }

    finishLevelWin(level: string) {
        this._appMetrikaCaller.finishLevel(level, true);
        this._firebaseCaller.finishLevel(level, true);
    }

    finishLevelLose(level: string) {
        this._appMetrikaCaller.finishLevel(level, false);
        this._firebaseCaller.finishLevel(level, true);
    }
}