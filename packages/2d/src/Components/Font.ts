import { useType } from "@hex-engine/core";
import FontMetrics, { DrawableFont } from "./FontMetrics";

export type FontImplementation = DrawableFont & {
  measureText: ReturnType<typeof FontMetrics>["measureText"];
};

export default function Font(impl: FontImplementation) {
  useType(Font);

  return impl;
}
