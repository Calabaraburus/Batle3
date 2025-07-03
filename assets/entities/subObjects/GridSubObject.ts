import { GridCell } from "../field/GridCell";


export abstract class GridSubObject {
    protected cell: GridCell | null = null;

    // Вызывается, когда субобъект прикрепляется к ячейке
    onAttach(cell: GridCell): void {
        this.cell = cell;
        this.onInit();
    }

    // Вызывается при откреплении
    onDetach(): void {
        this.onDestroy();
        this.cell = null;
    }

    // В GridSubObject
    public setHidden(hidden: boolean): void {
        // по умолчанию ничего — переопределяется в потомках
    }

    // Переопределяется в потомках
    protected abstract onInit(): void;
    protected abstract onDestroy(): void;
}
