// Project: Batle2
//
// Author: Natalchishin Taras
//
// Calabaraburus (c) 2023

import { log } from "cc";
import { ReadonlyMatrix2D } from "./ReadonlyMatrix2D";
import { DEBUG } from "cc/env";
import { IN_DEBUG } from "../../globals/globals";

export class Matrix2D<T> extends ReadonlyMatrix2D<T> {
  constructor(rows: number, cols: number) {
    super(rows, cols, null);
  }

  set(row: number, col: number, value: T) {
    if (IN_DEBUG()) {
      if (value == null) {
        log();
      }
    }
    this.matrix[col * this.rows + row] = value;
  }

  clear() {
    this.matrix.length = 0;
    this._cols = 0;
    this._rows = 0;
  }

  toReadonly(): ReadonlyMatrix2D<T> {
    return new ReadonlyMatrix2D<T>(this.rows, this.cols, this.matrix);
  }
}
