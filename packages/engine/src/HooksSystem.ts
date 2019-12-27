import { makeHooksSystem } from "concubine";
import { ComponentInterface } from "./Component";

const HooksSystem = makeHooksSystem<ComponentInterface>()({
  addChildComponent: (instance) => <C extends ComponentInterface>(
    child: C
  ): C => {
    instance._childrenToAdd.push(child);
    return child;
  },

  getComponent: (instance) => instance.getComponent.bind(instance),
  enable: (instance) => instance.enable.bind(instance),
  disable: (instance) => instance.disable.bind(instance),

  getEntity: (instance) => () => instance.entity,

  onUpdate: (instance) => (handler: ComponentInterface["update"]) => {
    instance.update = handler;
  },
  onDraw: (instance) => (handler: ComponentInterface["draw"]) => {
    instance.draw = handler;
  },
  onEntityReceived: (instance) => (
    handler: ComponentInterface["onEntityReceived"]
  ) => {
    instance.onEntityReceived = handler;
  },
  onDisabled: (instance) => (handler: ComponentInterface["onDisabled"]) => {
    instance.onDisabled = handler;
  },
  onEnabled: (instance) => (handler: ComponentInterface["onEnabled"]) => {
    instance.onEnabled = handler;
  },
});

export default HooksSystem;
