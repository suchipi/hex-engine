import { Disposable } from "./Disposable";

export class EventEmitter<
  Event extends { eventType: string; eventPhase: string }
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

    return new Disposable(() => {
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
