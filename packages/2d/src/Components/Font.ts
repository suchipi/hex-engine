import { useType } from "@hex-engine/core";
import FontMetrics, { DrawableFont } from "./FontMetrics";

export type FontImplementation = DrawableFont & {
  measureText: ReturnType<typeof FontMetrics>["measureText"];
};

/**
 * This Component defines a baseline interface for Font Components,
 * so that other Components can consume fonts without concern for their
 * implementation details.
 *
 * It is rarely used directly; instead, use `BMFont` or `SystemFont`.
 */
export default function Font(impl: FontImplementation) {
  useType(Font);

  return impl;
}
