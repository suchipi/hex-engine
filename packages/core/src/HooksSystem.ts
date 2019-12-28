import { makeHooksSystem } from "concubine";
import { ComponentInterface } from "./Component";
import instantiate from "./instantiate";

const HooksSystem = makeHooksSystem<ComponentInterface>()({
  create: (instance) => <Func extends (...args: any[]) => any>(
    ...args: Parameters<Func>[0] extends void
      ? [Func]
      : [Func, Parameters<Func>[0]]
  ): ReturnType<Func> extends {}
    ? ComponentInterface & ReturnType<Func>
    : ComponentInterface => {
    const [componentFunc, props] = args;

    const child = instantiate(componentFunc, props, instance.entity);
    instance.entity.addComponent(child);

    // @ts-ignore
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
  onDisabled: (instance) => (handler: ComponentInterface["onDisabled"]) => {
    instance.onDisabled = handler;
  },
  onEnabled: (instance) => (handler: ComponentInterface["onEnabled"]) => {
    instance.onEnabled = handler;
  },

  _getInstance: (instance) => () => instance,
});

export default HooksSystem;
