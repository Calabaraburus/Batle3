import { log, native } from 'cc';

export class ReviewCaller {
    public callReview() {
        try {
            native.jsbBridgeWrapper.dispatchEventToNative("requestReviewCall");
        } catch (e) {

            if (typeof e === "string") {
                console.error(e);
            } else if (e instanceof Error) {
                console.error(e.message);
            }
        }

    }
}