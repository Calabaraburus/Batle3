// Project: Batle2
//
// Author: Natalchishin Taras
//
// Calabaraburus (c) 2023

export interface IVirtualisable {
  virtualize(): void;
}

export function isIVirtualisable(object: object): object is IVirtualisable {
  return object != null && "virtualize" in object;
}
