import { Component, Entity } from "./Interface";
import { EventEmitter } from "./EventEmitter";

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

export const events = new EventEmitter<CoreEvent>();
