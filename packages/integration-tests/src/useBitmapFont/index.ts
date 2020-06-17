import { useNewComponent, BMFont } from "@hex-engine/2d";
import silver from "./silver.fnt";

export default function useBitmapFont() {
  return useNewComponent(() => BMFont(silver));
}
