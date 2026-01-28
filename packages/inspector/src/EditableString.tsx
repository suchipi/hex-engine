import React from "inferno-compat";

export type EditableStringProps = {
  color: string;
  value: string;
  onChange: (value: string) => void;
  expanded: boolean;
};

export type EditableStringState = {
  isEditing: boolean;
  editedValue: string;
};

export default class EditableString extends React.Component<
  EditableStringProps,
  EditableStringState
> {
  state = {
    isEditing: false,
    editedValue: this.props.value,
  };

  private _measureWidthSpan: HTMLSpanElement | null = null;
  private _inputEl: HTMLInputElement | HTMLTextAreaElement | null = null;

  private _isMounted: boolean = false;
  componentDidMount(): void {
    this._isMounted = true;
    this._updateWidth();
  }
  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(
    prevProps: EditableStringProps,
    prevState: typeof this.state
  ) {
    if (
      prevProps.expanded !== this.props.expanded ||
      prevProps.value !== this.props.value ||
      prevState.editedValue !== this.state.editedValue
    ) {
      this._updateWidth();
    }
  }

  private _updateWidth() {
    if (this.props.expanded) return;

    const measureWidthSpan = this._measureWidthSpan;
    const inputEl = this._inputEl;

    if (!measureWidthSpan) return;
    if (!inputEl) return;

    measureWidthSpan.style.display = "inline";
    const rect = measureWidthSpan.getBoundingClientRect();
    measureWidthSpan.style.display = "none";

    inputEl.style.width = rect.width + "px";
  }

  render() {
    const { color, value, expanded } = this.props;
    const { isEditing, editedValue } = this.state;

    const TagName = expanded ? "textarea" : "input";

    const currentValue = isEditing ? editedValue : value;

    return (
      <>
        <span
          style={{ display: "none" }}
          ref={(el) => {
            this._measureWidthSpan = el;
          }}
          className="measure-width"
        >
          {currentValue}
        </span>
        <TagName
          ref={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
            this._inputEl = el;
          }}
          style={{ color, font: "inherit", "max-width": "200px" }}
          value={currentValue}
          onFocus={() => {
            this.setState({
              isEditing: true,
              editedValue: value,
            });
          }}
          onInput={(event: {
            currentTarget: HTMLTextAreaElement | HTMLInputElement;
          }) => {
            this._updateWidth();

            this.setState({ editedValue: event.currentTarget.value }, () => {
              if (this._isMounted) {
                this.props.onChange(event.currentTarget.value);
              }
            });
          }}
          onBlur={() => {
            this.setState({ isEditing: false });
          }}
          onKeyDown={(
            event: KeyboardEvent & {
              currentTarget: HTMLInputElement | HTMLTextAreaElement;
            }
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
            this.setState({ editedValue: newValue }, () => {
              if (this._isMounted) {
                this.props.onChange(newValue);
              }
            });
          }}
        />
      </>
    );
  }
}
