import BaseComponent, {
  ComponentConfig,
  ComponentInterface,
} from "./Component";

type SimpleConfig = {
  update({
    delta,
    getComponent,
  }: {
    delta: number;
    getComponent: ComponentInterface["getComponent"];
  }): void;

  draw({
    context,
    canvas,
    getComponent,
  }: {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    getComponent: ComponentInterface["getComponent"];
  }): void;
};

export default function simpleComponent(
  config: Partial<ComponentConfig & SimpleConfig>
): ComponentInterface {
  class SimpleComponent extends BaseComponent {
    update(delta: number) {
      if (config.update) {
        config.update({
          delta,
          getComponent: this.getComponent.bind(this),
        });
      }
    }

    draw({
      context,
      canvas,
    }: {
      context: CanvasRenderingContext2D;
      canvas: HTMLCanvasElement;
    }) {
      if (config.draw) {
        config.draw({
          context,
          canvas,
          getComponent: this.getComponent.bind(this),
        });
      }
    }
  }

  return new SimpleComponent();
}
