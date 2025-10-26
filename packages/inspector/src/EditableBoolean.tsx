import React from "preact/compat";

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
          onChange(event.currentTarget.checked);
        }}
      />
      <span style={{ color }}>{String(value)}</span>
    </>
  );
}
