//  Polisy - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

export interface IPolicy {
  action?: object;
  reward?: number;
}

export interface Policy {
  [name: string]: Array<IPolicy>;
}
