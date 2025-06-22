import { _decorator, Prefab, CCObject } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Конфигурация спауна одного типа предмета.
 * Используется в SubObjectGenerator для генерации бонусов.
 */
@ccclass('SpawnConfig')
export class SpawnConfig extends CCObject {
    @property({ type: Prefab })
    prefab: Prefab | null = null;

    @property({ type: Number })
    count = 0;
}
