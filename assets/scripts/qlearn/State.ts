//  State.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

export default class State {
  obj?: object;
  action?: object;
  reward?: number;

  constructor(obj?: object, action?: object, reward?: number) {
    this.obj = obj;
    this.action = action;
    this.reward = reward;
  }

  get hash(): string {
    return JSON.stringify(this.obj);
  }
}
