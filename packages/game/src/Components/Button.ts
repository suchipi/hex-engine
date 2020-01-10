import {
  useNewComponent,
  useEntityName,
  Position,
  Vec2,
  useDraw,
  useUpdate,
  Mouse,
  Label,
  useType,
} from "@hex-engine/2d";
import useGameFont from "game/src/Hooks/useGameFont";

export default function Button({
  calcPosition,
  text,
  onClick,
}: {
  calcPosition: (bounds: Vec2) => Vec2;
  text: string;
  onClick: () => void;
}) {
  useType(Button);
  useEntityName(`Button - ${text}`);

  const font = useGameFont();
  const label = useNewComponent(() => Label({ text, font }));

  const position = useNewComponent(Position);

  const padding = 2;
  const size = label.size.add(padding * 2);

  const mouse = useNewComponent(() => Mouse({ bounds: size }));

  mouse.onClick(onClick);

  useUpdate(() => {
    size.replace(label.size.add(padding));
    position.replace(calcPosition(size));
  });

  useDraw((context) => {
    context.fillStyle = mouse.isPressing && mouse.isHovering ? "grey" : "white";
    const rect = size.round();
    context.fillRect(0, 0, rect.x, rect.y);

    context.strokeStyle = mouse.isHovering ? "black" : "transparent";
    context.strokeRect(0.5, 0.5, rect.x, rect.y);

    label.drawLabel({ context, x: padding, y: padding });
  });
}
