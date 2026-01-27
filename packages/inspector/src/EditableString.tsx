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

  measureWidthRef = React.createRef<HTMLSpanElement>();
  inputRef = React.createRef<HTMLInputElement | HTMLTextAreaElement>();

  _isMounted: boolean = false;
  componentDidMount(): void {
    this._isMounted = true;
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
      if (this.props.expanded) return;

      const measureWidth = this.measureWidthRef.current;
      const input = this.inputRef.current;

      if (!measureWidth) return;
      if (!input) return;

      measureWidth.style.display = "inline";
      const rect = measureWidth.getBoundingClientRect();
      measureWidth.style.display = "none";

      input.style.width = rect.width + "px";
    }
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
          ref={this.measureWidthRef}
          className="measure-width"
        >
          {currentValue}
        </span>
        <TagName
          ref={this.inputRef as any}
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
            if (!expanded && this.measureWidthRef.current) {
              event.currentTarget.style.width =
                this.measureWidthRef.current.getBoundingClientRect().width +
                "px";
            }

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
