import { _decorator, Component, Node } from 'cc';
import { UnitGroupManager } from './UnitGroupManager';
import { wait } from './TimeUtils';
import { BattleUIPanel } from '../UI_components/BattleUIPanel';
import { ScoreManager } from '../pointsSystem/ScoreManager';
import { HexGridManager } from '../field/HexGridManager';
import { ItemSubObject } from '../bonusItems/ItemSubObject';
import { BattleBot } from '../battleBot/BattleBot';
import { GridCell } from '../field/GridCell';
import { HexCell } from '../field/HexCell';
import { ShieldEffectSubObject } from '../bonusItems/shieldEffect/ShieldEffectSubObject';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';
import { VisualEffectPlayer } from '../battleEffects/VisualEffectPlayer';

const { ccclass, property } = _decorator;

export enum Turn {
    Player,
    Enemy,
}

@ccclass('BattleController')
export class BattleController extends Component {
    public static instance: BattleController;

    @property({ type: HexGridManager })
    gridManager: HexGridManager | null = null;

    // @property({ type: TurnLabelController })
    // turnLabelController: TurnLabelController | null = null;

    @property({ type: Node })
    battleUIPanelNode: Node | null = null;

    private battleUIPanel: BattleUIPanel | null;
    public currentTurn: Turn = Turn.Player;
    public selectedItem: ItemSubObject | null = null;

    private bot: BattleBot;

    onLoad() {
        BattleController.instance = this;
    }

    start() {
        if (this.gridManager) {
            // Инициализируем бота с доступом к гриду и методами завершения хода и открытия ячейки
            this.bot = new BattleBot(
                this.gridManager,
                () => this.endTurn(),
                (cell: GridCell) => this.openAndRevealCell(cell),
                (cell: GridCell) => this.attackCell(cell) // ✅ передаём корректную логику
            );

        }
        this.currentTurn = Turn.Player;
        if(this.battleUIPanelNode){
            this.battleUIPanel = this.battleUIPanelNode?.getComponent(BattleUIPanel);
            if (this.battleUIPanel){
                ScoreManager.instance.init(this.battleUIPanel);
            }
        }

        this.updateTurnLabel();
    }

    // Обновляет текст с информацией о текущем ходе
    updateTurnLabel() {
        // if (this.turnLabelController) {
        //     const text = this.currentTurn === Turn.Player ? 'Ваш хід' : 'Хід противника';
        //     this.turnLabelController.show(text, 1.5);
        // }
        // обновляем игрока на панели
        this.battleUIPanel?.updateTurn(this.currentTurn);  
    }

    // Открывает клетку, снимает туман, применяет визуальные эффекты
    openAndRevealCell(cell: GridCell) {
        if (!cell) return;

        cell.addParameter('opened', true);
        this.gridManager?.revealCell(cell);

        const hexCell = cell.getVisualNode()?.getComponent(HexCell);
        hexCell?.markAsOpened();
        hexCell?.showDestroyedEffect?.();
    }

    // Выполняет атаку по клетке, проверяя юнита и предмет внутри
    attackCell(cell: GridCell) {
        if (!cell) return;

        this.playExplosionEffect(cell);

        // 🛡️ Щит блокирует урон
        const blocked = ShieldEffectSubObject.tryIntercept(cell);
        if (blocked) {
            this.endTurn();
            return;
        }

        const unit = cell.getSubObjects().find(obj => obj instanceof UnitSubObject) as UnitSubObject;

        if (unit && unit.isAlive) {
            ScoreManager.instance.registerHit();
            unit.markAsDead();
            UnitGroupManager.instance.onUnitDestroyed(unit);
        } else {
            ScoreManager.instance.registerMiss();
        }

        this.openAndRevealCell(cell); // теперь безопасно


        // 💣 Проверка авто-предметов после атаки
        if (this.checkAndTriggerAutoItems()) return;

        this.endTurn();
    }

    // Завершает текущий ход и переключает ход между игроком и ботом
    async endTurn() {
        this.currentTurn = this.currentTurn === Turn.Player ? Turn.Enemy : Turn.Player;
        this.updateTurnLabel();

        if (this.currentTurn === Turn.Enemy) {
            setTimeout(() => this.bot.act(), 1000);
        } 

        await wait(1000);
    }

    // Обрабатывает клик по визуальной ячейке (HexCell)
    public onCellClicked(hexCell: HexCell): void {
        if (this.currentTurn !== Turn.Player || !this.gridManager) return;

        const cell = hexCell.getLogicalCell();
        if (!cell) return;

        const isOpened = cell.getParameter('opened') === true;
        const cellType = cell.getParameter<number>('type');
        const playerType = 1;

        // 1. Применение активного предмета
        if (this.tryUseSelectedItem(cell)) return;

        // 2. Активация предмета на вражеском тайле
        if (this.tryActivateItem(cell)) return;

        // 3. Если уже открыта — ничего не делаем
        if (isOpened) return;

        // 🔒 Игнорируем клик по своим клеткам вообще
        if (cellType === playerType) return;

        // 4. Иначе — обычная атака
        this.attackCell(cell);
    }

    // Пробует применить выбранный предмет, если он готов
    private tryUseSelectedItem(cell: GridCell): boolean {
        if (!this.selectedItem || !this.selectedItem.isReadyToArm()) return false;

        const success = this.selectedItem.tryApplyEffectTo(cell);
        if (success) {
            this.selectedItem = null;
            
            // 💣 Проверка авто-предметов после использования
            if (this.checkAndTriggerAutoItems()) return true;
        }
        return true;
    }

    // Пробует активировать предмет в клетке (если возможно)
    private tryActivateItem(cell: GridCell): boolean {
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        const playerType = this.currentTurn === Turn.Player ? 1 : 2;

        // 🔒 Защита: нельзя активировать предметы на своих клетках
        if (cell.getParameter('type') === playerType) {
            return false;
        }

        if (item && item.canBeActivatedBy(cell, playerType)) {
            if (!item.isReadyToArm()) {
                item.arm();
            }
            this.selectedItem = item;
            return true;
        }
        return false;
    }

    // 💣 Обработка мгновенного предмета 
    private tryAutoTriggerItem(cell: GridCell): boolean {
        const item = cell.getSubObjects().find(obj => obj instanceof ItemSubObject) as ItemSubObject;
        if (!item || item.isReadyToUse()) return false;

        const triggered = item.tryApplyEffectTo(cell);
        if (triggered) {
            this.selectedItem = null;
            this.endTurn(); // 💥 Мгновенно завершаем ход при срабатывании
            return true;
        }

        item.activate();
        this.selectedItem = item;
        return false;
    }

    private checkAndTriggerAutoItems(): boolean {
        if (!this.gridManager) return false;

        const cells = this.gridManager.getAllCells();
        for (const cell of cells) {
            const isOpened = cell.getParameter('opened') === true;
            if (!isOpened) continue;

            const autoItem = cell.getSubObjects().find(obj =>
                obj instanceof ItemSubObject &&
                obj.isAutoTriggered &&
                !obj.isReadyToUse()
            ) as ItemSubObject;

            if (autoItem) {
                const triggered = autoItem.tryApplyEffectTo(cell);
                if (triggered) {
                    this.selectedItem = null;
                    this.endTurn(); // 💥 завершение хода при успешной активации
                    return true;
                }
            }
        }

        return false;
    }

    // вызов анимации 
    protected playExplosionEffect(cell: GridCell): void {
        VisualEffectPlayer.instance.playExplosion(cell);
    }
}