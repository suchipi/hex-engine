import React from "react";
import { useStateTree } from "react-state-tree";
import Button from "./Button";

export default function Expandable({
  label,
  preview,
  className,
  children,
  hasContent,
  onMouseEnter,
  onMouseLeave,
}: {
  label?: React.ReactNode;
  preview?: React.ReactNode;
  className: React.ReactNode;
  children: React.ReactNode;
  hasContent: boolean;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}) {
  const [expanded, setExpanded] = useStateTree(false, "e");

  const toggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div style={{ paddingLeft: 8, paddingTop: 2 }}>
      <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <Button
          style={{
            color: "rgb(110, 110, 110)",
            display: "inline-block",
            fontSize: 12,
            marginRight: 3,
            userSelect: "none",
            transform: expanded ? "rotateZ(90deg)" : "",
          }}
          onClick={toggle}
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
            onClick={toggle}
          >
            {label}:
          </Button>
        ) : null}

        {className ? (
          <Button style={{ marginRight: "0.7em" }} onClick={toggle}>
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
