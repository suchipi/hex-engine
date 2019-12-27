import Entity from "./Entity";
import Canvas from "./Canvas";
import Component from "./Component";
import Preloader from "./Preloader";
import makeComponent from "./makeComponent";
import makeComponentClass from "./makeComponentClass";
import { createElement } from "./Element";

export * from "./Models";
export * from "./Components";
export {
  Component,
  Entity,
  Canvas,
  Preloader,
  makeComponent,
  makeComponentClass,
  createElement,
};

import HooksSystem from "./HooksSystem";
export const component = HooksSystem.hooks;
