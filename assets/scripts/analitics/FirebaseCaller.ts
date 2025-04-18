import { log, native } from 'cc';

export class FirebaseCaller {
    public startLevel(level: string) {
        try {
            native.jsbBridgeWrapper.dispatchEventToNative("requestFirebaseLevelStartCall", level);
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
                native.jsbBridgeWrapper.dispatchEventToNative("requestFirebaseLevelFinishWinCall", level);
            } else {
                native.jsbBridgeWrapper.dispatchEventToNative("requestFirebaseLevelFinishLoseCall", level);
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