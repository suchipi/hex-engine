import React from "inferno-compat";
import Button from "./Button";

export type ExpandableProps = {
  label?: React.ReactNode;
  preview?: React.ReactNode;
  className: React.ReactNode;
  children: React.ReactNode;
  hasContent: boolean;
  expanded: boolean;
  isSelected: boolean;
  onExpand: () => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onContextMenu?: (event: MouseEvent) => void;
};

export default class Expandable extends React.Component<ExpandableProps> {
  element: HTMLDivElement | null = null;
  prevElement: HTMLDivElement | null = null;
  elementRefCallback = (el: HTMLDivElement) => {
    if (this.element) {
      this.prevElement = this.element;
    }
    this.element = el;
    this._scrollElementIntoViewIfChanged(this.props);
  };

  componentWillUnmount(): void {
    this.element = null;
    this.prevElement = null;
  }

  componentDidUpdate(prevProps: ExpandableProps) {
    this._scrollElementIntoViewIfChanged(prevProps);
  }

  _scrollElementIntoViewIfChanged(prevProps: ExpandableProps) {
    if (
      this.props.isSelected !== prevProps.isSelected ||
      this.element !== this.prevElement
    ) {
      this.element?.scrollIntoView({ block: "center" });
    }
  }

  render() {
    const {
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
    } = this.props;

    return (
      <div
        ref={this.elementRefCallback}
        style={{
          position: "relative",
          "padding-left": "8px",
          "padding-top": "2px",
        }}
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
                height: "18px",
                background: "rgba(176,118,199,0.35)",
                "pointer-events": "none",
              }}
            />
          )}
          <Button onClick={onExpand}>
            <div
              style={{
                color: "rgb(110, 110, 110)",
                display: "inline-block",
                "font-size": "12px",
                "margin-right": "3px",
                "user-select": "none",
                transform: expanded ? "rotateZ(90deg)" : "",
              }}
            >
              ▶
            </div>
            {label && (
              <span
                style={{
                  color: "rgb(136, 19, 145)",
                  "user-select": "none",
                  "margin-right": "0.7em",
                }}
              >
                {label}
              </span>
            )}
            {className && (
              <span style={{ "margin-right": "0.7em" }}>{className}</span>
            )}
          </Button>
          {expanded ? null : preview}
        </span>

        {expanded && (
          <div>
            {(hasContent ? children : null) || (
              <span style={{ "padding-left": "8px", "padding-top": "2px" }}>
                {preview}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
}
