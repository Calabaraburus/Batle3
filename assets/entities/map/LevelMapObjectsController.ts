import { _decorator, CCString, Component, Node } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LevelMapObjectsController')
export class LevelMapObjectsController {
    @property({ type: CCString, visible: true })
    levelName = "";

    @property({ type: Node, visible: true })
    levelButtonNode: Node;

    @property({ type: [Node], visible: true })
    editionalObjects: Node[] = [];
}
