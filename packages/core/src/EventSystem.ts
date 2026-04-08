import { makeDisposable } from "./Disposable";
import { Component, Entity } from "./Interface";

export enum CoreEventType {
  ENTITY_CREATE = "ENTITY_CREATE",
  ENTITY_DESTROY = "ENTITY_DESTROY",
  ENTITY_DISABLE = "ENTITY_DISABLE",
  ENTITY_ENABLE = "ENTITY_ENABLE",
  ENTITY_ADD_CHILD = "ENTITY_ADD_CHILD",
  ENTITY_REMOVE_CHILD = "ENTITY_REMOVE_CHILD",
  ENTITY_ADD_COMPONENT = "ENTITY_ADD_COMPONENT",
  ENTITY_REMOVE_COMPONENT = "ENTITY_REMOVE_COMPONENT",
  COMPONENT_CREATE = "COMPONENT_CREATE",
  COMPONENT_ENABLE = "COMPONENT_ENABLE",
  COMPONENT_DISABLE = "COMPONENT_DISABLE",
}

export enum CoreEventPhase {
  BEFORE = "BEFORE",
  AFTER = "AFTER",
}

export type CoreEvent =
  | {
      eventType: CoreEventType.ENTITY_CREATE;
      eventPhase: CoreEventPhase.BEFORE;
      componentFactory: () => any;
      parent: Entity | null;
    }
  | {
      eventType: CoreEventType.ENTITY_CREATE;
      eventPhase: CoreEventPhase.AFTER;
      componentFactory: () => any;
      parent: Entity | null;
      entity: Entity;
    }
  | {
      eventType: CoreEventType.ENTITY_DESTROY;
      eventPhase: CoreEventPhase;
      entity: Entity;
    }
  | {
      eventType: CoreEventType.ENTITY_ENABLE;
      eventPhase: CoreEventPhase;
      entity: Entity;
    }
  | {
      eventType: CoreEventType.ENTITY_DISABLE;
      eventPhase: CoreEventPhase;
      entity: Entity;
    }
  | {
      eventType: CoreEventType.ENTITY_ADD_CHILD;
      eventPhase: CoreEventPhase;
      parent: Entity;
      child: Entity;
    }
  | {
      eventType: CoreEventType.ENTITY_REMOVE_CHILD;
      eventPhase: CoreEventPhase;
      parent: Entity;
      child: Entity;
    }
  | {
      eventType: CoreEventType.ENTITY_ADD_COMPONENT;
      eventPhase: CoreEventPhase;
      entity: Entity;
      componentFactory: () => any;
      component: Component;
    }
  | {
      eventType: CoreEventType.ENTITY_REMOVE_COMPONENT;
      eventPhase: CoreEventPhase;
      entity: Entity;
      component: Component;
    }
  | {
      eventType: CoreEventType.COMPONENT_CREATE;
      eventPhase: CoreEventPhase.BEFORE;
      componentFactory: () => any;
      entity: Entity;
    }
  | {
      eventType: CoreEventType.COMPONENT_CREATE;
      eventPhase: CoreEventPhase.AFTER;
      componentFactory: () => any;
      entity: Entity;
      component: Component;
    }
  | {
      eventType: CoreEventType.COMPONENT_ENABLE;
      eventPhase: CoreEventPhase;
      component: Component;
    }
  | {
      eventType: CoreEventType.COMPONENT_DISABLE;
      eventPhase: CoreEventPhase;
      component: Component;
    };

export class EventSystem<
  Event extends { eventType: string; eventPhase: string } = CoreEvent
> {
  listeners = new Map<
    Event["eventType"],
    Map<Event["eventPhase"], Set<(event: Event) => void>>
  >();

  register<
    SomeEventType extends Event["eventType"],
    SomeEventPhase extends Event["eventPhase"]
  >(
    eventType: SomeEventType,
    eventPhase: SomeEventPhase,
    listener: (
      event: Event & { eventType: SomeEventType; eventPhase: SomeEventPhase }
    ) => void
  ) {
    const phaseMap =
      this.listeners.get(eventType) ??
      (this.listeners.set(eventType, new Map()),
      this.listeners.get(eventType))!;

    const listenersSet =
      phaseMap.get(eventPhase) ??
      (phaseMap.set(eventPhase, new Set()), phaseMap.get(eventPhase))!;

    listenersSet.add(listener as (event: Event) => void);

    return makeDisposable(() => {
      listenersSet.delete(listener as (event: Event) => void);
    });
  }

  emit(event: Event) {
    const phaseMap = this.listeners.get(event.eventType as Event["eventType"]);
    if (phaseMap == null) {
      return;
    }

    const listeners = phaseMap.get(event.eventPhase as Event["eventPhase"]);
    if (listeners == null) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }
}

// Can be overridden to add different event types
export let eventSystemSingleton = new EventSystem<CoreEvent>();
