import {
  useNewComponent,
  useEntityName,
  Position,
  Vec2,
  useDraw,
  Clickable,
  Label,
  useType,
} from "@hex-engine/2d";
import useGameFont from "game/src/Hooks/useGameFont";

export default function Button({
  position,
  text,
  onClick,
}: {
  position: (bounds: Vec2) => Vec2;
  text: string;
  onClick: () => void;
}) {
  useType(Button);
  useEntityName(`Button - ${text}`);

  const font = useGameFont();
  const label = useNewComponent(() => Label({ text, font }));

  useNewComponent(() => Position(position(label.bounds)));

  const clickable = useNewComponent(Clickable);

  clickable.onClick(onClick);

  useDraw((context) => {
    context.fillStyle = clickable.isHovering ? "red" : "blue";
    const rect = label.bounds.round();
    context.fillRect(0, 0, rect.x, rect.y);

    label.drawLabel({ context });
  });
}
