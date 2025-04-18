import {
  _decorator,
  Component,
  Node,
  Prefab,
  CCInteger,
  instantiate,
  Vec3,
  UITransform,
} from "cc";
import { BonusModel } from "../../../models/BonusModel";
import { CardController } from "./CardController";
const { ccclass, property } = _decorator;

@ccclass("CardFieldController")
export class CardFieldController extends Component {
  private _cards: CardController[] = [];
  private _selectedCard: CardController | null = null;

  private _bonuses: BonusModel[] = [];

  @property(CCInteger)
  distance: number;

  @property(Prefab)
  cardPrefab: Prefab;

  get selectedCard(): CardController | null {
    return this._selectedCard;
  }

  get cards(): CardController[] {
    return this._cards;
  }

  get bonuses() {
    return this._bonuses;
  }

  set bonuses(value: BonusModel[]) {
    if (this._bonuses != value) {
      this._bonuses = value;
      this.generateCardControllers();
    }
  }

  start() {
    this.generateCardControllers();
  }

  private generateCardControllers(): void {
    this.clearCrads();

    this.bonuses.forEach((b, i) => {
      this.instantiateCard(b, i);
    });
  }

  private clearCrads() {
    this.cards.forEach((card) => {
      card.destroy();
    });
    this._cards = [];
  }

  private instantiateCard(bonusModel: BonusModel, index: number) {
    const card = instantiate(this.cardPrefab).getComponent(CardController);
    if (card != null) {
      const pos = card?.node.position;
      const cardUI = card.getComponent(UITransform);
      card.node.parent = this.node;

      let xPos = 0;
      if (cardUI?.width != undefined) {
        xPos = index * cardUI?.width + cardUI?.width / 2;
      }

      if (index != 0) {
        xPos += index * this.distance;
      }

      card.node.position = new Vec3(xPos, pos?.y, pos?.z);
      card.setModel(bonusModel);
      card.node.on("cardClicked", this.selectCard, this);

      this._cards.push(card);
    }
  }

  selectCard(card: CardController, selected: boolean) {
    if (selected == false) {
      this._selectedCard = null;
    } else {
      this._selectedCard = card;
    }
    this.node.emit("selectedCardChanged", this._selectedCard);

    this._cards.forEach((c) => {
      if (c != card) {
        c.selected = false;
      }
    });
  }

  updateData() {
    this._cards.forEach((card) => card.updateData());
  }
}
