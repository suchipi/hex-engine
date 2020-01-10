import React, { useState, useRef, useEffect } from "react";

export default function EditableString({
  color,
  value,
  onChange,
  expanded,
}: {
  color: string;
  value: string;
  onChange: (value: string) => void;
  expanded: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const measureWidthRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const TagName = expanded ? "textarea" : "input";

  useEffect(() => {
    if (expanded) return;

    const measureWidth = measureWidthRef.current;
    const input = inputRef.current;

    if (!measureWidth) return;
    if (!input) return;

    measureWidth.style.display = "inline";
    const rect = measureWidth.getBoundingClientRect();
    measureWidth.style.display = "none";

    input.style.width = rect.width + "px";
  }, [editedValue, value]);

  const currentValue = isEditing ? editedValue : value;

  return (
    <>
      <span
        style={{ display: "none" }}
        ref={measureWidthRef}
        className="measure-width"
      >
        {currentValue}
      </span>
      <TagName
        // @ts-ignore
        ref={inputRef}
        style={{ color, font: "inherit", maxWidth: "200px" }}
        value={currentValue}
        onFocus={() => {
          setEditedValue(value);
          setIsEditing(true);
        }}
        onChange={(
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          if (!expanded && measureWidthRef.current) {
            event.target.style.width =
              measureWidthRef.current.getBoundingClientRect().width + "px";
          }

          setEditedValue(event.target.value);
          onChange(event.target.value);
        }}
        onBlur={() => {
          setIsEditing(false);
        }}
        onKeyDown={(
          event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          if (String(Number(currentValue)) !== currentValue) return;

          let delta = 0;
          if (event.key === "ArrowDown") {
            delta = -1;
          } else if (event.key === "ArrowUp") {
            delta = 1;
          }

          if (event.shiftKey && event.altKey) {
            delta *= Math.PI / 16;
          } else if (event.shiftKey) {
            delta *= 10;
          } else if (event.altKey) {
            delta *= 0.1;
          }

          const newValue = String(Number(currentValue) + delta);
          setEditedValue(newValue);
          onChange(newValue);
        }}
      />
    </>
  );
}
