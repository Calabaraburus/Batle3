// Project: Batle2
//
// Author: Natalchishin Taras
//
// Calabaraburus (c) 2023

import { Matrix2D } from "./Matrix2D";

export class ReadonlyMatrix2D<T> {
  protected matrix: T[];

  protected _rows: number;
  get rows(): number {
    return this._rows;
  }

  protected _cols: number;
  get cols(): number {
    return this._cols;
  }

  constructor(rows: number, cols: number, matrix: T[] | null) {
    this._rows = rows;
    this._cols = cols;
    this.matrix = matrix == null ? new Array<T>() : matrix;
  }

  get(row: number, col: number): T {
    return this.matrix[col * this.rows + row];
  }

  getSafe(row: number, col: number): T | null {
    if (row < 0 || col < 0 || row >= this._rows || col >= this._cols) {
      return null;
    }

    return this.matrix[col * this.rows + row];
  }

  forEach(callback: (item: T, i: number, j: number) => void) {
    for (let rowIndex = 0; rowIndex < this._rows; rowIndex++) {
      for (let colIndex = 0; colIndex < this._cols; colIndex++) {
        callback(this.get(rowIndex, colIndex), rowIndex, colIndex);
      }
    }
  }

  forEachInRow(rowId: number, callback: (item: T, colId: number) => void) {
    for (let colIndex = 0; colIndex < this._cols; colIndex++) {
      callback(this.get(rowId, colIndex), colIndex);
    }
  }

  forEachCol(colId: number, callback: (item: T, rowId: number) => void) {
    for (let rowIndex = 0; rowIndex < this._rows; rowIndex++) {
      callback(this.get(rowIndex, colId), rowIndex);
    }
  }

  filter(filtFunc: (val: T) => boolean | undefined): T[] {
    return this.matrix.filter(filtFunc);
  }

  clone(): Matrix2D<T> {
    const clone = new Matrix2D<T>(this.rows, this.cols);
    return clone;
  }
}
