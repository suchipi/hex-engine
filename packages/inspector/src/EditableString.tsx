import React, { useState } from "react";

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

  const TagName = expanded ? "textarea" : "input";

  return (
    <TagName
      style={{ color }}
      value={isEditing ? editedValue : value}
      onFocus={() => {
        setEditedValue(value);
        setIsEditing(true);
      }}
      onChange={(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        setEditedValue(event.target.value);
        onChange(event.target.value);
      }}
      onBlur={() => {
        setIsEditing(false);
      }}
    />
  );
}
