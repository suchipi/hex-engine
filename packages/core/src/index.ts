import Entity from "./Entity";
import Component from "./Component";
import HooksSystem from "./HooksSystem";
import RunLoop from "./Components/RunLoop";

const {
  create,
  getComponent,
  enable,
  disable,
  getEntity,
  onUpdate,
  onDraw,
  onDisabled,
  onEnabled,
} = HooksSystem.hooks;

export {
  Component,
  Entity,
  RunLoop,
  create,
  getComponent,
  enable,
  disable,
  getEntity,
  onUpdate,
  onDraw,
  onDisabled,
  onEnabled,
};
