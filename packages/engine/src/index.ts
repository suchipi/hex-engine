import Entity from "./Entity";
import Canvas from "./Canvas";
import Component from "./Component";
import Preloader from "./Preloader";
import makeComponent from "./makeComponent";
import makeComponentClass from "./makeComponentClass";
import HooksSystem from "./HooksSystem";

export * from "./Models";
export * from "./Components";
export {
  Component,
  Entity,
  Canvas,
  Preloader,
  makeComponent,
  makeComponentClass,
};
export const component = HooksSystem.hooks;
