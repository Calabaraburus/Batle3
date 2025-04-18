//  helpers.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras
import "reflect-metadata";
import { __private } from "cc";

const ccclassKey = Symbol("ccclass");

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace helpers {
  export function typeName<T>(
    classConstructor: __private._types_globals__Constructor<T>
  ): string {
    return classConstructor.name;
  }
}
