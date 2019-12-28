import { Entity, EntityImplementation } from "./Entity";
import { Component } from "./Component";
import HooksSystem from "./HooksSystem";
import * as Components from "./Components";

const createEntity: typeof EntityImplementation._create = (...args) => {
  return EntityImplementation._create(...args);
};

const {
  useNewComponent,
  useExistingComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
} = HooksSystem.hooks;

export {
  Components,
  Entity,
  Component,
  createEntity,
  useNewComponent,
  useExistingComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
};
export * from "./Hooks";
