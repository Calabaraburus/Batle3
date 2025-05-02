import { Component, Node } from 'cc';

export abstract class TileObject extends Component {
    owner: 'player' | 'enemy' | null = null;

    abstract onActivate(): void; // предмет: клик, юнит: ход
}
