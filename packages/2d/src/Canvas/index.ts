import { useNewComponent, useType, Components } from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";
import { UpdateChildren, useUpdate } from "./UpdateChildren";
import { DrawChildren, useDraw } from "./DrawChildren";

type Props = {
  element?: HTMLCanvasElement;
  backgroundColor: string;
};

export default function Canvas(props: Props) {
  useType(Canvas);

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

  useNewComponent(Components.RunLoop);
  useNewComponent(() =>
    DrawChildren({
      canvas,
      context,
      backgroundColor,
    })
  );
  useNewComponent(UpdateChildren);
  if (process.env.NODE_ENV !== "production") {
    useNewComponent(Inspector);
  }

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

    fullscreen({ pixelZoom = 1 }: { pixelZoom: number }) {
      Object.assign(document.body.style, {
        margin: 0,
        padding: 0,
        overflow: "hidden",
      });

      const fitToWindow = () => {
        this.resize({
          realWidth: window.innerWidth,
          realHeight: window.innerHeight,
          pixelWidth: window.innerWidth / pixelZoom,
          pixelHeight: window.innerHeight / pixelZoom,
        });
      };
      window.addEventListener("resize", fitToWindow);
      fitToWindow();
    },
  };
}

export { useUpdate, useDraw };
