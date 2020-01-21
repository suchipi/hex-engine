import HooksSystem from "../HooksSystem";
import { Entity } from "../Interface";

const { useType } = HooksSystem.hooks;

/**
 * Define what should happen if an Error occurs in this entity or its descendants.
 * @param onError A function that will receive the Error that was thrown, and should
 * present it to the user somehow.
 *
 * If `onError` throws, then the Error it threw will be passed up to the next
 * parent error handler.
 */
function ErrorBoundary(onError: (error: Error) => void) {
  useType(ErrorBoundary);

  return {
    onError,
  };
}

/**
 * Run all the error handlers, given an Entity to start searching from and an Error
 * to pass to the handlers.
 *
 * This is designed to be run inside the `catch` clause of a `try/catch`.
 * @param ent The entity that "caused" the Error; check if it has an `ErrorBoundary` component, and if it does not, check its ancestors.
 * @param error The Error that was thrown, which will be passed to the `onError` handlers the `ErrorBoundary` compponents registered.
 *
 * If no ErrorBoundary component can be found, then the error will be logged with `console.error`.
 */
function runHandlers(ent: Entity, error: Error) {
  let currentEnt: Entity | null = ent;
  let errorHandler: ReturnType<typeof ErrorBoundary> | null = null;
  let currentError: Error = error;

  while (currentEnt && !errorHandler) {
    errorHandler = currentEnt.getComponent(ErrorBoundary);
    currentEnt = currentEnt.parent;

    if (errorHandler) {
      try {
        errorHandler.onError(currentError);
      } catch (newError) {
        // If this error handler threw, then keep looking for a parent error handler to handle the error that *it* threw
        currentError = newError;
        errorHandler = null;
        continue;
      }
    }
  }

  if (!errorHandler) {
    console.error(error);
  }
}

/**
 * A Component that defines what should happen if an Error occurs in this entity or its descendants.
 */
export default Object.assign(ErrorBoundary, { runHandlers });
