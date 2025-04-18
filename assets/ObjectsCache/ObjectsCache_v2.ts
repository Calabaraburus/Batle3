
import {
    _decorator,
    Component,
    instantiate,
    Node,
    __private,
    Prefab,
    js,
} from "cc";
import { CacheObject } from "./CacheObject";
import { ICacheObject } from "./ICacheObject";
import { IObjectsCache } from "./IObjectsCache";
import { Queue } from "../scripts/Queue";
import { ObjectsCache } from "./ObjectsCache";
const { ccclass, property } = _decorator;

@ccclass("ObjectsCache_v2")
export class ObjectsCache_v2 extends Component {
    @property(Prefab)
    prefabs: Prefab[] = [];
}
