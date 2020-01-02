import React from "react";
import ReactDOM from "react-dom";
import {
  Entity,
  useRootEntity,
  useCallbackAsCurrent,
  Components,
} from "@hex-engine/core";
import { StateTreeProvider } from "react-state-tree";
import debounce from "lodash.debounce";
import App from "./App";

type RunLoopAPI = ReturnType<typeof Components.RunLoop>;

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
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
}) {
  return (
    <StateTreeProvider
      initialValue={initialState}
      onUpdate={debouncedSaveState}
    >
      <App entity={entity} runLoop={runLoop} />
    </StateTreeProvider>
  );
}

export default function Inspector({
  pauseOnStart = false,
}: Partial<{
  el: HTMLElement;
  pauseOnStart: boolean;
}> = {}) {
  let hasPausedOnStart = false;

  const el = document.createElement("div");
  document.body.appendChild(el);

  const tick = useCallbackAsCurrent(() => {
    const entity = useRootEntity();
    const runLoop = entity.getComponent(Components.RunLoop);
    if (runLoop && pauseOnStart && !hasPausedOnStart) {
      runLoop.pause();
      hasPausedOnStart = true;
    }

    ReactDOM.render(<Root entity={entity} runLoop={runLoop} />, el);

    requestAnimationFrame(tick);
  });

  tick();
}
