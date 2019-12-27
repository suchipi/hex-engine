export type ComponentFunction<Props extends {}, API extends {}> = (
  props: Props
) => API;

export default class Element<Props extends {}, API extends {}> {
  type: ComponentFunction<Props, API>;
  props: Props;

  constructor(type: ComponentFunction<Props, API>, props: Props) {
    this.type = type;
    this.props = props;
  }
}

interface CreateElement {
  <Props extends {}, API extends {}>(
    type: ComponentFunction<Props, API>,
    props?: Props,
    ...children: Array<never>
  ): Element<Props, API>;
  (type: typeof Array, props?: {}, ...children: Array<Element<{}, {}>>): Array<
    Element<{}, {}>
  >;
}

export const createElement: CreateElement = <Props extends {}, API extends {}>(
  type: ComponentFunction<Props, API> | typeof Array,
  props: Props,
  ...children: Array<Element<{}, {}> | never>
) => {
  if (type === Array) {
    return [children];
  } else {
    if (children.length > 0) {
      throw new Error("JSX children are not supported");
    }

    return new Element<Props, API>(
      // @ts-ignore
      type,
      // @ts-ignore
      props || {}
    );
  }
};
