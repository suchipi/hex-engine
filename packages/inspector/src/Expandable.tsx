import React from "react";
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
  label?: React.ReactNode;
  preview?: React.ReactNode;
  className: React.ReactNode;
  children: React.ReactNode;
  hasContent: boolean;
  expanded: boolean;
  isSelected: boolean;
  onExpand: () => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}) {
  return (
    <div style={{ position: "relative", paddingLeft: 8, paddingTop: 2 }}>
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
              background: "rgba(176, 118, 199, 0.3)",
            }}
          />
        )}
        <Button
          style={{
            color: "rgb(110, 110, 110)",
            display: "inline-block",
            fontSize: 12,
            marginRight: 3,
            userSelect: "none",
            transform: expanded ? "rotateZ(90deg)" : "",
          }}
          onClick={onExpand}
        >
          ▶
        </Button>

        {label ? (
          <Button
            style={{
              color: "rgb(136, 19, 145)",
              userSelect: "none",
              marginRight: "0.7em",
            }}
            onClick={onExpand}
          >
            {label}:
          </Button>
        ) : null}

        {className ? (
          <Button style={{ marginRight: "0.7em" }} onClick={onExpand}>
            {className}
          </Button>
        ) : null}

        {expanded ? null : preview}
      </span>

      {expanded ? (
        <div>
          {(hasContent ? children : null) || (
            <span style={{ paddingLeft: 8, paddingTop: 2 }}>{preview}</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
