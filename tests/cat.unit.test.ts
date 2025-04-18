//  cat.unit.test.ts - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

import { suite, test } from "@testdeck/mocha";
import * as _chai from "chai";
import { FieldController } from "../assets/entities/field/FieldController";

_chai.should();
_chai.expect;

@suite
export class CatModuleTest {
  private SUT: FieldController;
  private name: string;
  private color: string;

  before() {
    this.name = "Tom";
    this.color = "black";
    this.SUT = new FieldController();
  }

  @test "Field is created"() {
    this.SUT.name.should.to.not.be.undefined;
  }
}
