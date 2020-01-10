import {
  useNewComponent,
  useEntityName,
  Position,
  Vec2,
  useDraw,
  useUpdate,
  Clickable,
  Label,
  useType,
  BoundingBox,
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

  const clickable = useNewComponent(() => Clickable({ bounds: size }));

  clickable.onClick(onClick);

  useUpdate(() => {
    size.replace(label.size.add(padding));
    position.replace(calcPosition(size));
  });

  useDraw((context) => {
    context.fillStyle =
      clickable.isPressing && clickable.isHovering ? "grey" : "white";
    const rect = size.round();
    context.fillRect(0, 0, rect.x, rect.y);

    context.strokeStyle = clickable.isHovering ? "black" : "transparent";
    context.strokeRect(0.5, 0.5, rect.x, rect.y);

    label.drawLabel({ context, x: padding, y: padding });
  });
}
