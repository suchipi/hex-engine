import Entity from "./Entity";
import Component from "./Component";
import { createElement } from "./Element";
import HooksSystem from "./HooksSystem";

const {
  create,
  getComponent,
  enable,
  disable,
  getEntity,
  onUpdate,
  onDraw,
  onEntityReceived,
  onDisabled,
  onEnabled,
} = HooksSystem.hooks;

export {
  Component,
  Entity,
  createElement,
  create,
  getComponent,
  enable,
  disable,
  getEntity,
  onUpdate,
  onDraw,
  onEntityReceived,
  onDisabled,
  onEnabled,
};
