import { useType } from "@hex-engine/core";

export default function Inspector() {
  useType(Inspector);

  return {
    getSelectMode: () => false,
    toggleSelectMode() {},
    selectEntity() {},
    hide() {},
    show() {},
  };
}

export function useInspectorHover() {
  return {
    isHovered: false,
    onHoverStart() {},
    onHoverEnd() {},
  };
}

export function useInspectorSelect() {
  return {
    getSelectMode: () => false,
    inspectEntity() {},
  };
}
