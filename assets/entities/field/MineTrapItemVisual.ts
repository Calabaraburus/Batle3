import { _decorator } from 'cc';
import { BaseItemVisual } from './BaseItemVisual';
const { ccclass } = _decorator;

@ccclass('MineTrapItemVisual')
export class MineTrapItemVisual extends BaseItemVisual {
    public override setActive(): void {
        super.setActive();
        // Можно добавить анимацию мины, свечение и т.п.
    }
}
