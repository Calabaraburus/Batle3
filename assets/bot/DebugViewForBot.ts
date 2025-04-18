import { DEBUG } from "cc/env";
import { DebugView } from "../entities/ui/debugger/DebugView";
import { IN_DEBUG } from "../globals/globals";


export class DebugViewForBot extends DebugView {
    public log(value: string) {
        if (IN_DEBUG()) {
            super.log(value);
        }
    }
}
