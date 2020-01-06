import { useType } from "@hex-engine/core";
import { useDraw } from "../Canvas";
import { basicRender } from "./BasicRenderer";
import ImageFilter from "./ImageFilter";

export default function FilterRenderer(filter: ReturnType<typeof ImageFilter>) {
  useType(FilterRenderer);

  useDraw((context, backstage) => {
    basicRender(backstage);
    filter.apply(backstage, context);
  });
}
