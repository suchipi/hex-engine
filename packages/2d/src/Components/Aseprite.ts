import { useType } from "@hex-engine/core";

export default function Aseprite(data: AsepriteLoader.Data) {
  useType(Aseprite);

  return {
    data,
  };
}
