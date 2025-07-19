import { _decorator, BlockInputEvents, Component, Label, Node, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { HexCell } from '../field/HexCell';
import { BattleController } from '../battle/BattleController';
import { LevelManager } from '../levels/LevelManager';
import { GameContext } from '../menu/GameContext';
import { HexGridManager } from '../field/HexGridManager';
import { TurnManager } from '../battle/TurnManager';
import { UnitSubObject } from '../subObjects/units/UnitSubObject';


const { ccclass, property } = _decorator;

@ccclass('TutorialManager')
export class TutorialManager extends Component {
    @property({ type: Node }) tutorialOverlay: Node | null = null;
    @property({ type: Node }) highlightHole: Node | null = null;
    @property({ type: Node }) blocker: Node | null = null;
    @property({ type: HexGridManager }) gridManager: HexGridManager | null = null;

    @property({ type: Node })
    infoWindowNode: Node | null = null;

    @property({ type: Label })
    infoMessageLabel: Label | null = null;

    @property({ type: Node })
    clickCatcherNode: Node | null = null;

    @property({ type: Node })
    LabelTap: Node | null = null;

    public static instance: TutorialManager;

    private currentStep = 0;
    private isTutorialActive = false;
    private allowedClicks: { x: number, y: number }[] = [];

    private basePosMessage: { x: number, y: number } = {x:0, y:0};

    onLoad() {
        TutorialManager.instance = this;
    }

    public async startTutorial(): Promise<void> {
        this.currentStep = 0;
        this.isTutorialActive = true;

        if (this.tutorialOverlay) this.tutorialOverlay.active = true;
        if (this.highlightHole) this.highlightHole.active = true;

        // GameContext.instance.selectedLevel = 'level_tutorial';
        // await LevelManager.instance.loadLevelFromJson(GameContext.instance.selectedLevel);

        await BattleController.instance.start();  // ⏳ ждём окончания генерации

        this.runCurrentStep();
    }

    private async runCurrentStep(): Promise<void> {
    if (!this.isTutorialActive) return;

    switch (this.currentStep) {
        case 0: {
            const shieldTile = this.findFirstItemOfType('shield');
            if (!shieldTile) return console.warn('Shield tile not found!');
            this.showTutorialMessage('Тапни на тайл', shieldTile);
            this.highlightCell(shieldTile);
            this.setAllowedClicks([shieldTile]);
            break;
        }
        case 1:{
            this.setClickCatcherActive(true);
            this.setTapLabelActive(true);
            this.setHolelActive(false);
            this.setBlockActive(false);
            this.showTutorialMessage('После твоей атаки всегда следует атака противника', this.basePosMessage);
            // if (this.tutorialOverlay) this.tutorialOverlay.active = false;

            // await BattleController.instance.bot.act();
            // this.nextStep();
            break;
        }

        case 2:{
            this.setHolelActive(true);
            const openedPlayerTile = this.findFirstOpenedPlayerTile();
            if (!openedPlayerTile) return console.warn('opened Player tile not found!');
            this.showTutorialMessage('Теперь один из твоих тайлов уничтожен', openedPlayerTile);
            this.highlightCell(openedPlayerTile);
            // if (this.tutorialOverlay) this.tutorialOverlay.active = false;

            // await BattleController.instance.bot.act();
            // this.nextStep();
            break;
        }

        case 3: {          
            this.setClickCatcherActive(false);
            this.setTapLabelActive(false);
            this.setHolelActive(true);
            this.setBlockActive(true);
            // if (this.tutorialOverlay) this.tutorialOverlay.active = true;
            const shieldItemTile = this.findFirstItemOfType('shield');
            if (!shieldItemTile) return console.warn('Shield item tile not found!');
            this.showTutorialMessage('Активируй бонус щита', shieldItemTile);
            this.highlightCell(shieldItemTile);
            this.setAllowedClicks([shieldItemTile]);
            break;
        }
        case 4: {
            const playerUnit = this.findFirstUnitOfOwner('player');
            if (!playerUnit) return console.warn('Player unit not found!');
            this.showTutorialMessage('Примени его на свой отряд',playerUnit);
            this.highlightCell(playerUnit);
            this.setAllowedClicks([playerUnit]);
            break;
        }
        case 5: {
            this.setClickCatcherActive(true);
            this.setTapLabelActive(true);
            this.setHolelActive(true);
            this.setBlockActive(false);
            const playerUnit = this.findFirstUnitOfOwner('player');
            if (!playerUnit) return console.warn('Player unit not found!');
            this.showTutorialMessage('Тайлы, где есть щит защищены от первого попадания',playerUnit);
            this.highlightCell(playerUnit);
            // this.setAllowedClicks([shieldEffect]);
            break;
        }
        case 6: {
            this.setClickCatcherActive(false);
            this.setTapLabelActive(false);
            this.setHolelActive(true);
            this.setBlockActive(true);
            const rocketTile = this.findFirstItemOfType('rocket');
            if (!rocketTile) return console.warn('Rocket tile not found!');
            this.showTutorialMessage('Есть бонусы, которые применяются на дружественном поле, а есть те, которые используются на поле противника.Теперь тапни на этот тайл', rocketTile);
            this.highlightCell(rocketTile);
            this.setAllowedClicks([rocketTile]);
            break;
        }
        case 7:
            this.setClickCatcherActive(true);
            this.setTapLabelActive(true);
            this.setHolelActive(false);
            this.setBlockActive(false);
            // this.hideTutorialMessage();
            this.showTutorialMessage('Когда игрок применяет бонус, это не считается за ход', this.basePosMessage);
            // if (this.tutorialOverlay) this.tutorialOverlay.active = false;
            // await BattleController.instance.bot.act();
            // this.nextStep();
            break;

        case 8: {
            this.setClickCatcherActive(false);
            this.setTapLabelActive(false);
            this.setHolelActive(true);
            this.setBlockActive(true);
            
            if (this.tutorialOverlay) this.tutorialOverlay.active = true;
            const rocketItemTile = this.findFirstItemOfType('rocket');
            if (!rocketItemTile) return console.warn('Rocket item tile not found!');
            this.showTutorialMessage('Активируй ракету', rocketItemTile);
            this.highlightCell(rocketItemTile);
            this.setAllowedClicks([rocketItemTile]);
            break;
        }
        case 9: {
            const enemyUnit = this.findFirstUnitOfOwner('enemy');
            if (!enemyUnit) return console.warn('Enemy unit not found!');
            this.showTutorialMessage('Запусти ракету по скрытому тайлу', enemyUnit);
            this.highlightCell(enemyUnit);
            this.setAllowedClicks([enemyUnit]);
            break;
        }
        case 10:
            this.setClickCatcherActive(true);
            this.setTapLabelActive(true);
            this.setHolelActive(false);
            this.setBlockActive(false);
            this.showTutorialMessage('Добивай противника! Обучение завершено.', this.basePosMessage);
            if (this.tutorialOverlay) this.tutorialOverlay.active = false;
            this.finishTutorial();
            break;
    }
}

    private findFirstItemOfType(type: string): { x: number, y: number } | null {
        const allCells = this.gridManager?.getAllCells() || [];
        for (const cell of allCells) {
            if (cell.hasItem() && cell.getSubObjects().some(sub => sub.constructor.name.toLowerCase().includes(type))) {
                return { x: cell.x, y: cell.y };
            }
        }
        return null;
    }

    private findFirstEffectOfType(type: string): { x: number, y: number } | null {
        const allCells = this.gridManager?.getAllCells() || [];
        for (const cell of allCells) {
            if (cell.hasEffect() && cell.getSubObjects().some(sub => sub.constructor.name.includes(type))) {
                return { x: cell.x, y: cell.y };
            }
        }
        return null;
    }

    private findFirstUnitOfOwner(ownerType: 'player' | 'enemy'): { x: number, y: number } | null {
        const allCells = this.gridManager?.getAllCells() || [];
        const ownerNum = ownerType === 'player' ? 1 : 2;

        for (const cell of allCells) {
            const cellType = cell.getParameter<number>('type');
            const isOpened = cell.getParameter<boolean>('opened');
            if (cellType === ownerNum && !isOpened && cell.hasUnit()) {
                const unit = cell.getSubObjects().find(sub => sub instanceof UnitSubObject) as UnitSubObject;
                if (unit && unit.isAlive) {
                    return { x: cell.x, y: cell.y };
                }
            }
        }

        return null;
    }
    
    private findFirstOpenedPlayerTile(): { x: number, y: number } | null {
        const allCells = this.gridManager?.getAllCells() || [];
        const playerType = 1; // 1 = player

        for (const cell of allCells) {
            const isPlayerCell = cell.getParameter('type') === playerType;
            const isOpened = cell.getParameter('opened') === true;

            if (isPlayerCell && isOpened) {
                return { x: cell.x, y: cell.y };
            }
        }

        return null;
    }

    public canClickCell(cell: HexCell): boolean {
        return this.allowedClicks.some(pos => pos.x === cell.gridX && pos.y === cell.gridY);
    }

    public handleCellClick(cell: HexCell): void {
        const gridCell = cell.getLogicalCell();
        if (!gridCell) return;

        // ✅ Отдаём клик в BattleController
        BattleController.instance.onCellClicked(cell);

        // this.nextStep();
    }

    public nextStep(): void {
        this.currentStep++;
        this.runCurrentStep();
    }

    private setAllowedClicks(positions: ({ x: number, y: number } | null)[]): void {
        this.allowedClicks = positions.filter((p): p is { x: number, y: number } => p !== null);
    }

    private highlightCell(pos: { x: number, y: number }): void {
        const gridManager = BattleController.instance.gridManager;
        const gridCell = gridManager?.getCell(pos.x, pos.y);
        const visualNode = gridCell?.getVisualNode();

        if (!visualNode || !this.tutorialOverlay) return;

        const tileTransform = visualNode.getComponent(UITransform);
        const overlayTransform = this.tutorialOverlay.getComponent(UITransform);

        if (!tileTransform || !overlayTransform) return;

        // 1️⃣ Переносим Overlay в позицию тайла
        const worldPos = visualNode.getWorldPosition();
        this.tutorialOverlay.setWorldPosition(worldPos);

        // 2️⃣ Делаем Overlay квадратным по высоте тайла
        const height = tileTransform.contentSize.height;
        overlayTransform.setContentSize(height, height);

        // 3️⃣ Присваиваем scale от тайла
        const tileScale = visualNode.getScale();
        this.tutorialOverlay.setScale(tileScale);
    }

    private showTutorialMessage(text: string, pos: { x: number, y: number }): void {
        if (!this.infoWindowNode || !this.infoMessageLabel) return;

        const gridManager = BattleController.instance.gridManager;
        const gridCell = gridManager?.getCell(pos.x, pos.y);
        const visualNode = gridCell?.getVisualNode();

        if (!visualNode) return;
        const worldPos = visualNode.getWorldPosition();

        // Переводим в local
        const parent = this.infoWindowNode.parent;
        if (!parent) return;
        const localPos = parent.getComponent(UITransform)?.convertToNodeSpaceAR(worldPos);
        if (!localPos) return;

        // Смещаем в local
        const offsetX = localPos.x > 0 ? -600 : 600;
        const offsetY = 0;
        const finalPos = new Vec3(localPos.x + offsetX, localPos.y + offsetY, localPos.z);

        this.infoMessageLabel.string = text;

        const window = this.infoWindowNode;
        const opacity = window.getComponent(UIOpacity);
        if (!opacity) return;

        window.setPosition(finalPos);
        opacity.opacity = 0;
        window.setScale(new Vec3(0.7, 0.7, 1));
        window.active = true;

        tween(opacity).to(0.3, { opacity: 255 }).start();
        tween(window).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
    }

    private hideTutorialMessage(): void {
        if (!this.infoWindowNode) return;

        const window = this.infoWindowNode;
        const opacity = window.getComponent(UIOpacity);
        if (!opacity) return;

        tween(opacity)
            .to(0.2, { opacity: 0 })
            .call(() => window.active = false)
            .start();
    }

    public finishTutorial(): void {
        this.isTutorialActive = false;
        if (this.tutorialOverlay) this.tutorialOverlay.active = false;
        if (this.highlightHole) this.highlightHole.active = false;
        this.allowedClicks = [];
        this.hideTutorialMessage();
        this.setClickCatcherActive(false);
        this.setTapLabelActive(false);
    }

    public stop(): void {
        this.isTutorialActive = false;
        this.allowedClicks = [];
        if (this.tutorialOverlay) this.tutorialOverlay.active = false;
        if (this.highlightHole) this.highlightHole.active = false;
    }

    public get isActive(): boolean {
        return this.isTutorialActive;
    }

    // улавливатель тапов актив/нет
    private setClickCatcherActive(active: boolean): void {
        if (this.clickCatcherNode) {
            this.clickCatcherNode.active = active;
        }
    }

    public onNextButtonClicked(): void {
        if (!this.isTutorialActive) return;

        this.nextStep();
    }

    // label tap актив/нет
    private setTapLabelActive(active: boolean): void {
        if (this.LabelTap) {
            this.LabelTap.active = active;
        }
    }

    // Дыра актив/нет
    private setHolelActive(active: boolean): void {
        if (this.tutorialOverlay) {
            if (active == false){
                const overlayTransform = this.tutorialOverlay.getComponent(UITransform);

                if (!overlayTransform) return;
                // 2️⃣ Делаем Overlay маленьким
                overlayTransform.setContentSize(0,0);
            }
        }
    }

    // Блок актив/нет
    private setBlockActive(active: boolean): void {
        if (this.blocker) {
            if (active == false){
                this.blocker.getComponent(BlockInputEvents)!.enabled = active;
            }else{
                this.blocker.getComponent(BlockInputEvents)!.enabled = active;
            }
        }
    }
}
