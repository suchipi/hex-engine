import { useType, useNewComponent } from "@hex-engine/core";
import Font, { FontImplementation } from "./Font";

export default function BMFont(data: BMFontLoader.Font) {
  useType(BMFont);

  // TODO: satisfy FontImplementation
  return {
    data,
  };
}
