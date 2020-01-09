import HooksSystem from "../HooksSystem";
import { Entity } from "../Interface";

const { useType } = HooksSystem.hooks;

function ErrorBoundary(onError: (error: Error) => void) {
  useType(ErrorBoundary);

  return {
    onError,
  };
}

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

export default Object.assign(ErrorBoundary, { runHandlers });
