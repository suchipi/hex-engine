import React, { useState } from "react";
import Button from "./Button";

export default function Expandable({
  label,
  preview,
  className,
  children,
  hasContent,
}: {
  label?: React.ReactNode;
  preview?: React.ReactNode;
  className: React.ReactNode;
  children: React.ReactNode;
  hasContent: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div style={{ paddingLeft: 8, paddingTop: 2 }}>
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

      {expanded ? (
        <div>
          {(hasContent ? children : null) || (
            <span style={{ paddingLeft: 8, paddingTop: 2 }}>{preview}</span>
          )}
        </div>
      ) : (
        <span>{preview}</span>
      )}
    </div>
  );
}
