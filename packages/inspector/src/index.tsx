import React from "react";
import ReactDOM from "react-dom";
import {
  Entity,
  useRootEntity,
  useCallbackAsCurrent,
  useType,
  RunLoop,
  useNewComponent,
  ErrorBoundary,
} from "@hex-engine/core";
import { StateTreeProvider } from "react-state-tree";
import debounce from "lodash.debounce";
import useForceUpdate from "use-force-update";
import App from "./App";

type RunLoopAPI = ReturnType<typeof RunLoop>;

const initialState = localStorage.inspectorState
  ? JSON.parse(localStorage.inspectorState)
  : {};

function saveState(state: any) {
  localStorage.inspectorState = JSON.stringify(state);
}

const debouncedSaveState = debounce(saveState, 100);

function Root({
  entity,
  runLoop,
  error,
  forceUpdateTarget,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
  error: Error | null;
  forceUpdateTarget: { forceUpdate: null | (() => void) };
}) {
  const forceUpdate = useForceUpdate();

  forceUpdateTarget.forceUpdate = forceUpdate;

  return (
    <StateTreeProvider
      initialValue={initialState}
      onUpdate={debouncedSaveState}
    >
      <App entity={entity} runLoop={runLoop} error={error} />
    </StateTreeProvider>
  );
}

export default function Inspector({
  pauseOnStart = false,
}: Partial<{
  el: HTMLElement;
  pauseOnStart: boolean;
}> = {}) {
  useType(Inspector);

  const entity = useRootEntity();
  const runLoop = entity.getComponent(RunLoop);

  let error: Error | null = null;

  useNewComponent(() =>
    ErrorBoundary((err) => {
      console.error(err);
      error = err;
      runLoop?.pause();
    })
  );

  let hasPausedOnStart = false;

  const el = document.createElement("div");
  document.body.appendChild(el);

  const forceUpdateTarget: { forceUpdate: null | (() => void) } = {
    forceUpdate: null,
  };
  ReactDOM.render(
    <Root
      entity={entity}
      runLoop={runLoop}
      error={error}
      forceUpdateTarget={forceUpdateTarget}
    />,
    el,
    useCallbackAsCurrent(() => {
      const tick = useCallbackAsCurrent(() => {
        if (runLoop && pauseOnStart && !hasPausedOnStart) {
          runLoop.pause();
          hasPausedOnStart = true;
        }

        if (forceUpdateTarget.forceUpdate != null) {
          forceUpdateTarget.forceUpdate();
        }

        requestAnimationFrame(tick);
      });

      tick();
    })
  );
}
