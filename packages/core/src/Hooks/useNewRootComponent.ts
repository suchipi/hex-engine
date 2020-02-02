import instantiate from "../instantiate";
import { Component } from "../Interface";
import useRootEntity from "./useRootEntity";

export default function useNewRootComponent<T>(
  componentFunction: () => T
): T extends {} ? T & Component : Component {
  const rootEntity = useRootEntity();

  const child = instantiate(componentFunction, rootEntity);
  rootEntity.components.add(child);

  return child;
}
