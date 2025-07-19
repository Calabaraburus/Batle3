import { _decorator, Component, Node, UITransform, Graphics, Color } from 'cc';
const { ccclass } = _decorator;

@ccclass('HighlightHoleDrawer')
export class HighlightHoleDrawer extends Component {

    public drawCircleAroundHex(targetNode: Node, coef = 1): void {
        const graphics = this.getComponent(Graphics);
        const targetTransform = targetNode.getComponent(UITransform);
        const myTransform = this.getComponent(UITransform);

        if (!graphics || !targetTransform || !myTransform) return;

        // Очистим старый рисунок
        graphics.clear();

        // Размер хекса
        const width = targetTransform.contentSize.width;
        const height = targetTransform.contentSize.height;
        const radius = Math.min(width, height) * 0.5 * coef;

        // Подгоняем размеры HighlightHole node (чтобы Mask работал правильно)
        myTransform.setContentSize(width, height);

        // Рисуем круг в центре Graphics (0,0)
        graphics.lineWidth = 4;
        graphics.strokeColor = Color.WHITE;
        graphics.fillColor = new Color(255, 255, 255, 0); // прозрачная заливка

        graphics.circle(0, 0, radius);
        graphics.stroke();
    }
}
