import RunLoop from "./RunLoop";
import Entity from "./Entity";
import HasChildren from "./HasChildren";
import PresentsScenes from "./PresentsScenes";
import Scene from "./Scene";

export default class Canvas
  implements HasChildren<Entity | Scene>, PresentsScenes {
  _element: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;
  _runLoop: RunLoop;
  scenes: Set<Scene>;
  rootScene: Scene;
  activeScene: Scene;

  get entities() {
    return this.activeScene.entities;
  }

  constructor({ element }: { element?: HTMLCanvasElement } = {}) {
    if (element) {
      this._element = element;
    } else {
      this._element = document.createElement("canvas");
      document.body.appendChild(this._element);
    }

    const ctx = this._element.getContext("2d");
    if (ctx == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    this._ctx = ctx;

    this.scenes = new Set();

    this.rootScene = new Scene();
    this.scenes.add(this.rootScene);
    this.activeScene = this.rootScene;

    this._runLoop = new RunLoop((delta: number) => {
      const canvas = this._element;
      const context = this._ctx;
      this.scenes.forEach((scene) => {
        const isActive = scene === this.activeScene;
        scene.tick({
          isActive,
          delta,
          canvas,
          context,
        });
      });
    });

    this._runLoop.start();
  }

  present(scene: Scene) {
    this.scenes.add(scene);

    this.activeScene = scene;
  }

  hasChild(child: Entity | Scene): boolean {
    if (child instanceof Entity) {
      return this.activeScene.hasChild(child);
    } else if (child instanceof Scene) {
      return this.scenes.has(child);
    } else {
      return false;
    }
  }

  addChild(child: Entity | Scene): void {
    if (child instanceof Entity) {
      this.activeScene.addChild(child);
    } else if (child instanceof Scene) {
      this.scenes.add(child);
    }
  }

  removeChild(child: Entity | Scene): void {
    if (child instanceof Entity) {
      this.activeScene.removeChild(child);
    } else if (child instanceof Scene) {
      this.scenes.delete(child);
    }
  }
}
