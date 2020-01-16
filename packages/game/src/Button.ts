import {
  useNewComponent,
  useEntityName,
  Point,
  Polygon,
  useDraw,
  useUpdate,
  Pointer,
  Label,
  useType,
  Geometry,
  useInspectorHoverOutline,
} from "@hex-engine/2d";
import useGameFont from "./useGameFont";

export default function Button({
  calcPosition,
  text,
  onClick,
}: {
  calcPosition: (bounds: Point) => Point;
  text: string;
  onClick: () => void;
}) {
  useType(Button);
  useEntityName(`Button - ${text}`);

  const font = useGameFont();
  const label = useNewComponent(() => Label({ text, font }));

  let calculatedSize: Point;
  const padding = 3;
  function calcSize() {
    const metrics = font.measureText(label.text);
    return (calculatedSize = new Point(metrics.width, metrics.height).add(
      padding * 2
    ));
  }
  const size = calcSize();
  useInspectorHoverOutline(size);

  const geometry = useNewComponent(() =>
    Geometry({ shape: Polygon.rectangle(size) })
  );

  const pointer = useNewComponent(Pointer);

  pointer.onClick(onClick);

  useUpdate(() => {
    const previousSize = calculatedSize;
    const currentSize = calcSize();
    if (!previousSize.equals(currentSize)) {
      size.mutateInto(currentSize);
      geometry.position.mutateInto(calcPosition(size));
      geometry.shape = Polygon.rectangle(size);
    }
  });

  useDraw((context) => {
    context.fillStyle =
      pointer.isPressing && pointer.isInsideBounds
        ? "#aaa"
        : pointer.isInsideBounds
        ? "#ddd"
        : "#eee";
    const rect = size.round();
    context.fillRect(0, 0, rect.x, rect.y);
    label.draw(context, { x: padding, y: padding });
  });
}
