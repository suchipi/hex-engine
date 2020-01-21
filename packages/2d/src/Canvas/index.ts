import { useNewComponent, useType, RunLoop } from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";
import { UpdateChildren, useUpdate } from "./UpdateChildren";
import { DrawChildren, useRawDraw } from "./DrawChildren";
import DrawOrder, {
  useDebugOverlayDrawTime,
  useCanvasDrawOrderSort,
} from "./DrawOrder";
import polyfillContext from "./polyfillContext";

export default Object.assign(
  function Canvas(options: {
    element?: HTMLCanvasElement;
    backgroundColor: string;
  }) {
    useType(Canvas);

    const backgroundColor = options.backgroundColor;

    let canvas: HTMLCanvasElement;
    if (options.element) {
      canvas = options.element;
    } else {
      canvas = document.createElement("canvas");
      document.body.appendChild(canvas);
      canvas.style.userSelect = "none";
      canvas.style.msUserSelect = "none";
      canvas.style.webkitUserSelect = "none";
    }
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    const context = canvas.getContext("2d");
    if (context == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    polyfillContext(context);

    const backstageCanvas = document.createElement("canvas");
    backstageCanvas.width = canvas.width;
    backstageCanvas.height = canvas.height;

    const backstageContext = backstageCanvas.getContext("2d");
    if (backstageContext == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    polyfillContext(backstageContext);

    useNewComponent(RunLoop);
    useNewComponent(() =>
      DrawChildren({
        context,
        backstage: backstageContext,
        backgroundColor,
      })
    );
    useNewComponent(UpdateChildren);
    if (process.env.NODE_ENV !== "production") {
      useNewComponent(() => Inspector());
    }

    function setPixelated(on: boolean) {
      if (on) {
        canvas.style.imageRendering = navigator.userAgent.match(/firefox/i)
          ? "-moz-crisp-edges"
          : "pixelated";

        [
          "imageSmoothingEnabled",
          "mozImageSmoothingEnabled",
          "oImageSmoothingEnabled",
          "webkitImageSmoothingEnabled",
          "msImageSmoothingEnabled",
        ].forEach((property) => {
          // @ts-ignore
          context[property] = false;
        });
      } else {
        canvas.style.imageRendering = "";

        [
          "imageSmoothingEnabled",
          "mozImageSmoothingEnabled",
          "oImageSmoothingEnabled",
          "webkitImageSmoothingEnabled",
          "msImageSmoothingEnabled",
        ].forEach((property) => {
          // @ts-ignore
          context[property] = true;
        });
      }
    }

    setPixelated(true);

    return {
      element: canvas,
      context,
      backstage: backstageContext,

      setPixelated,

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

        backstageCanvas.width = pixelWidth;
        backstageCanvas.height = pixelHeight;
      },

      fullscreen({ pixelZoom = 1 }: { pixelZoom?: number } = {}) {
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
  },
  {
    DrawOrder,
  }
);

export {
  useUpdate,
  useRawDraw,
  useDebugOverlayDrawTime,
  useCanvasDrawOrderSort,
};
