import {
    _decorator,
    animation,
    Button,
    CCBoolean,
    CCInteger
} from 'cc';
import { Service } from '../services/Service';
import { stat } from 'original-fs';
import { GameManager } from '../game/GameManager';
import { FieldController } from '../field/FieldController';
import { LocalizedLabel } from '../../../extensions/i18n/assets/LocalizedLabel';
import { PlayerFieldController } from '../playerField/PlayerFieldController';
import { CardFieldController } from '../playerField/cardField/CardFieldController';
const { ccclass, property } = _decorator;

@ccclass('Tutorial1Logic')
export class Tutorial1Logic extends Service {
    private _animator: animation.AnimationController | null;
    private _gameManager: GameManager | null;
    private _endTutor = false;
    private _cardField: CardFieldController | null;
    private _field: FieldController | null;

    @property(Button)
    btn: Button;

    @property(animation.AnimationController)
    animators: animation.AnimationController[] = [];

    @property(CCInteger)
    currentTutorialGraphId = 0;
    private _activateCards: boolean;


    @property(CCBoolean)
    public get blockButton() {
        return !this.btn.node.active;
    }

    public set blockButton(value: boolean) {
        this.btn.node.active = !value;
    }

    @property(CCBoolean)
    public get skipBotTurn() {
        return this._gameManager ? this._gameManager.needToSkipBotTurn : false
    }

    public set skipBotTurn(val: boolean) {
        if (this._gameManager) this._gameManager.skipBotTurn(val)
    }

    @property(CCBoolean)
    public get endTutor() {
        return this._endTutor;
    }

    public set endTutor(val: boolean) {
        this._endTutor = val;
    }

    @property(CCBoolean)
    public get activateCards() {
        return this._activateCards;
    }

    public set activateCards(val: boolean) {

        if (this._activateCards != val) {
            this._activateCards = val

            if (val == true) {
                this._cardField?.bonuses.forEach(b => {
                    b.currentAmmountToActivate = b.priceToActivate;
                    b.active = true;
                }
                );

                this._cardField?.updateData();
            }
        }

    }

    start() {
        //this._animator = this.getComponent(animation.AnimationController);
        this._gameManager = this.getService(GameManager);
        this._field = this.getService(FieldController);
        this._field?.tileClickedEvent.on("FieldController", this.tileClicked, this);
        const playerField = this.getService(PlayerFieldController);
        if (playerField) {
            this._cardField = playerField.cardField;
            this._cardField.node.on("selectedCardChanged", this.cardSelect, this)
        }

        //  if (this._animator) {
        //this._animator = this.animators[this.currentTutorialGraphId];

        //this._animator.enabled = true;
        //   this._animator.
        //}
    }

    cardSelect() {
        this.next();
    }

    public setupGraph() {
        this._animator = this.getComponent(animation.AnimationController);
        if (this._animator) {
            this._animator.graph = this.animators[this.currentTutorialGraphId].graph;
            this._animator.__preload();
        }
    }

    tileClicked() {
        this.next();
    }

    next() {
        if (!this._animator) return;

        if (this._endTutor) {
            this.removeSubscriptions();
            this.skipBotTurn = false;
            this.node.active = false;
        } else {
            this._animator.setValue("next", true);
        }
    }

    removeSubscriptions() {
        this._field?.tileClickedEvent.off("FieldController", this.tileClicked, this);
        this._cardField?.node.off("selectedCardChanged", this.cardSelect, this);
    }

}


