//  GameStateMachine.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras
import { AnimationManager, animation, Component, debug, _decorator } from "cc";
import Finity from "finity";

const { ccclass, property } = _decorator;

@ccclass("Gr")
export class Gr extends Component {
  start() {
    this.ola();
  }

  ola() {
    const worker = Finity.configure()
      .initialState("ready")
      .on("task_submitted")
      .transitionTo("running")
      .state("running")
      .onEnter((state) => {
        debug("enter running");
      })
      .global()
      .onStateEnter((state) => console.log(`Entering state '${state}'`))
      .start();
  }
}
