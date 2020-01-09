import { useNewComponent, SystemFont } from "@hex-engine/2d";

export default function useGameFont() {
  return useNewComponent(() => SystemFont({ name: "Silver", size: 18 }));
}
