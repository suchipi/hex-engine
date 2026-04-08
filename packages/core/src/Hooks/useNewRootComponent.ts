import {
  CoreEventPhase,
  CoreEventType,
  eventSystemSingleton,
} from "../EventSystem";
import instantiate from "../instantiate";
import { Component } from "../Interface";
import useRootEntity from "./useRootEntity";

export default function useNewRootComponent<T>(
  componentFunction: () => T
): T extends {} ? T & Component : Component {
  const rootEntity = useRootEntity();

  const child = instantiate(componentFunction, rootEntity);

  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_ADD_COMPONENT,
    eventPhase: CoreEventPhase.BEFORE,
    componentFactory: componentFunction,
    entity: rootEntity,
    component: child,
  });

  rootEntity.components.add(child);

  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_ADD_COMPONENT,
    eventPhase: CoreEventPhase.AFTER,
    componentFactory: componentFunction,
    entity: rootEntity,
    component: child,
  });

  return child;
}
