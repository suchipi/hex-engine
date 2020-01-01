import React from "react";

export default function EditableBoolean({
  color,
  value,
  onChange,
}: {
  color: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span style={{ color }}>{String(value)}</span>
    </>
  );
}
