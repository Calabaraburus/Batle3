/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
//  register.js - ClbBlast
//
//  Calabaraburus (c) 2022
//
//  Author:Natalchishin Taras

const tsNode = require("ts-node");

const testTSConfig = require("./tests/testconfig.json");

tsNode.register({
  files: true,
  transpileOnly: true,
  project: "./tests/testconfig.json",
});
