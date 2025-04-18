// Project: Batle2
//
// Author: Natalchishin Taras
//
// Calabaraburus (c) 2023

export interface ICloneable {
  clone(): object;
}

export function isICloneable(object: object): object is ICloneable {
  return object != null && "clone" in object;
}
