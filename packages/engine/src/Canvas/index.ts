import * as core from "@hex-engine/core";
const { create } = core;
import Time from "./Time";
import Renderer from "./Renderer";
import Camera from "./Camera";
import { Angle, Point } from "../Models";

type Props = {
  element?: HTMLCanvasElement;
  backgroundColor: string;
};

function Canvas(props: Props) {
  const backgroundColor = props.backgroundColor;

  let canvas: HTMLCanvasElement;
  if (props.element) {
    canvas = props.element;
  } else {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
  }

  const context = canvas.getContext("2d");
  if (context == null) {
    throw new Error("2d drawing context type not supported by browser");
  }

  const renderer = create(Renderer, {
    canvas,
    context,
    backgroundColor,
  });
  const time = create(Time);
  create(Camera, {
    position: new Point(0, 0),
    zoom: 1,
    rotation: new Angle(0),
  });
  create(core.RunLoop, {
    onFrame: (delta: number) => {
      time.tick(delta);
      renderer.render();
    },
  });

  return {
    element: canvas,
    resize({
      realWidth,
      realHeight,
      pixelWidth,
      pixelHeight,
    }: {
      realWidth: number;
      realHeight: number;
      pixelWidth: number;
      pixelHeight: number;
    }): void {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      canvas.style.width = realWidth + "px";
      canvas.style.height = realHeight + "px";

      canvas.style.imageRendering = navigator.userAgent.match(/firefox/i)
        ? "-moz-crisp-edges"
        : "pixelated";
    },

    fullscreen({ pixelRatio = 1 }: { pixelRatio: number }) {
      Object.assign(document.body.style, {
        margin: 0,
        padding: 0,
        overflow: "hidden",
      });

      const fitToWindow = () => {
        this.resize({
          realWidth: window.innerWidth,
          realHeight: window.innerHeight,
          pixelWidth: window.innerWidth / pixelRatio,
          pixelHeight: window.innerHeight / pixelRatio,
        });
      };
      window.addEventListener("resize", fitToWindow);
      fitToWindow();
    },
  };
}

export default Object.assign(Canvas, {
  Time,
  Renderer,
  Camera,
});
