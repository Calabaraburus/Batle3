import {
    _decorator,
    __private,
    Prefab,
    CCInteger,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("CacheProtoItem")
export class CacheProtoItem {
    @property(Prefab)
    prefab: Prefab;

    @property(CCInteger)
    minCount: number;
}
