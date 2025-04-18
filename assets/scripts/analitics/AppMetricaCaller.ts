import { log, native } from 'cc';

export class AppMetricaCaller {
    public startLevel(level: string) {
        try {
            native.jsbBridgeWrapper.dispatchEventToNative("requestAppMetricaLevelStartCall", level);
        } catch (e) {

            if (typeof e === "string") {
                console.error(e);
            } else if (e instanceof Error) {
                console.error(e.message);
            }
        }

    }

    public finishLevel(level: string, win: boolean) {
        try {

            if (win) {
                native.jsbBridgeWrapper.dispatchEventToNative("requestAppMetricaLevelFinishWinCall", level);
            } else {
                native.jsbBridgeWrapper.dispatchEventToNative("requestAppMetricaLevelFinishLoseCall", level);
            }
        } catch (e) {

            if (typeof e === "string") {
                console.error(e);
            } else if (e instanceof Error) {
                console.error(e.message);
            }
        }

    }
}