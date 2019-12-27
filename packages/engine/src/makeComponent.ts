import { ComponentInterface } from "./Component";
import makeComponentClass, { DSL } from "./makeComponentClass";

export default function makeComponent(
  constructor: (
    dsl: DSL
  ) => void | ComponentInterface | Array<ComponentInterface>
): ComponentInterface {
  const klass = makeComponentClass(constructor);

  return new klass();
}
