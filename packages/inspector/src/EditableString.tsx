import React, { useState } from "react";

export default function EditableString({
  color,
  value,
  onChange,
}: {
  color: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  return (
    <input
      style={{ color }}
      value={isEditing ? editedValue : value}
      onFocus={() => {
        setEditedValue(value);
        setIsEditing(true);
      }}
      onChange={(event) => {
        setEditedValue(event.target.value);
        onChange(event.target.value);
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
    />
  );
}
