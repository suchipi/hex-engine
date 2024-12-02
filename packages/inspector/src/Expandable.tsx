import { createElement, ComponentChild } from "preact";
import { useRef, useEffect } from "preact/hooks";
import Button from "./Button";

export default function Expandable({
  label,
  preview,
  className,
  children,
  hasContent,
  expanded,
  isSelected,
  onExpand,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: {
  label?: ComponentChild;
  preview?: ComponentChild;
  className: ComponentChild;
  children: ComponentChild;
  hasContent: boolean;
  expanded: boolean;
  isSelected: boolean;
  onExpand: () => void;
  onMouseEnter?: (
    event: createElement.JSX.TargetedMouseEvent<HTMLElement>
  ) => void;
  onMouseLeave?: (
    event: createElement.JSX.TargetedMouseEvent<HTMLElement>
  ) => void;
  onContextMenu?: (
    event: createElement.JSX.TargetedMouseEvent<HTMLElement>
  ) => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected) {
      elementRef.current?.scrollIntoView({ block: "center" });
    }
  }, [isSelected, elementRef]);

  return (
    <div
      ref={elementRef}
      style={{ position: "relative", paddingLeft: 8, paddingTop: 2 }}
    >
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={onContextMenu}
      >
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100vw",
              width: "300vw",
              height: 18,
              background: "rgba(176,118,199,0.35)",
              pointerEvents: "none",
            }}
          />
        )}
        <Button onClick={onExpand}>
          <div
            style={{
              color: "rgb(110, 110, 110)",
              display: "inline-block",
              fontSize: 12,
              marginRight: 3,
              userSelect: "none",
              transform: expanded ? "rotateZ(90deg)" : "",
            }}
          >
            ▶
          </div>
          {label && (
            <span
              style={{
                color: "rgb(136, 19, 145)",
                userSelect: "none",
                marginRight: "0.7em",
              }}
            >
              {label}
            </span>
          )}
          {className && (
            <span style={{ marginRight: "0.7em" }}>{className}</span>
          )}
        </Button>
        {expanded ? null : preview}
      </span>

      {expanded && (
        <div>
          {(hasContent ? children : null) || (
            <span style={{ paddingLeft: 8, paddingTop: 2 }}>{preview}</span>
          )}
        </div>
      )}
    </div>
  );
}
