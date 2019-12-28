import { ComponentInterface, ComponentFunction } from "./Component";
import HooksSystem from "./HooksSystem";
import instantiate from "./instantiate";

export default class Entity {
  components: Set<ComponentInterface> = new Set();
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  isEnabled: boolean = false;

  static create<Func extends (...args: any[]) => any>(
    ...args: Parameters<Func>[0] extends void
      ? [Func]
      : [Func, Parameters<Func>[0]]
  ): Entity {
    const [componentFunc, props] = args;

    const ent = new Entity();

    ent.components = new Set();
    ent.isEnabled = false;

    const component = instantiate(componentFunc, props, ent);
    ent.addComponent(component);
    ent.enable();

    return ent;
  }

  _componentsByType(): Map<Function, ComponentInterface> {
    return new Map(
      [...this.components].map((component) => [component.type, component])
    );
  }

  disable() {
    this.isEnabled = false;

    for (const component of this.components) {
      component.disable();
    }

    for (const entity of this.children) {
      entity.disable();
    }
  }

  enable() {
    this.isEnabled = true;

    for (const component of this.components) {
      HooksSystem.withInstance(component, () => {
        component.enable();
      });
    }

    for (const entity of this.children) {
      entity.enable();
    }
  }

  update(delta: number) {
    if (!this.isEnabled) return;

    for (const component of this.components) {
      if (component.isEnabled) {
        HooksSystem.withInstance(component, () => {
          component.update(delta);
        });
      }
    }

    for (const entity of this.children) {
      if (entity.isEnabled) {
        entity.update(delta);
      }
    }
  }

  draw({
    canvas,
    context,
  }: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }) {
    if (!this.isEnabled) return;

    for (const component of this.components) {
      if (component.isEnabled) {
        HooksSystem.withInstance(component, () => {
          component.draw({
            canvas,
            context,
          });
        });
      }
    }

    for (const entity of this.children) {
      if (entity.isEnabled) {
        entity.draw({
          canvas,
          context,
        });
      }
    }
  }

  hasChild(child: Entity): boolean {
    return this.children.has(child);
  }
  addChild(child: Entity): void {
    this.children.add(child);
    child.parent = this;
  }
  removeChild(child: Entity): void {
    this.children.delete(child);
    child.parent = null;
  }

  addComponent(component: ComponentInterface) {
    // @ts-ignore
    this.components.add(component);
    if (this.isEnabled && component.isEnabled) {
      component.enable();
    }
  }

  getComponent<API>(
    componentClass: ComponentFunction<any, API>
  ): null | (API extends {} ? ComponentInterface & API : ComponentInterface) {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }

  findRootUpwards(): Entity {
    let ent: Entity = this;
    while (ent.parent) {
      ent = ent.parent;
    }
    return ent;
  }
}
