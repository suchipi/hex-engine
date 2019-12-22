import Gamepad from "./Gamepad";
import Keyboard from "./Keyboard";
import Position from "./Position";
import Rectangle from "./Rectangle";

const Components = {
  gamepad: Gamepad,
  keyboard: Keyboard,
  position: Position,
  rectangle: Rectangle,
};

export default Components;

export type ComponentsClassMap = typeof Components;

export type ComponentsDataMap = {
  [ComponentName in keyof ComponentsClassMap]: ReturnType<
    InstanceType<ComponentsClassMap[ComponentName]>["defaults"]
  >;
};

export type ComponentsInstanceMap = {
  [ComponentName in keyof ComponentsClassMap]: InstanceType<
    ComponentsClassMap[ComponentName]
  >;
};

export type ComponentName = keyof ComponentsClassMap;
