import { EventTarget } from "cc";
/** Represents object that can be stored in cache */
export interface ICacheObject {
  //destroyEvent: EventTarget;
  cacheCreate(): void;
  cacheDestroy(): void;
}
