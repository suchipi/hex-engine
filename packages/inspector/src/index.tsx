import React from "react";
import ReactDOM from "react-dom";
import {
  Entity,
  useRootEntity,
  useCallbackAsCurrent,
  Components,
} from "@hex-engine/core";
import { StateTreeProvider, StateKey } from "react-state-tree";
import debounce from "lodash.debounce";
import Tree from "./Tree";
import TimeControls from "./TimeControls";

type RunLoopAPI = ReturnType<typeof Components.RunLoop>;

const initialState = localStorage.inspectorState
  ? JSON.parse(localStorage.inspectorState)
  : {};

function saveState(state: Object) {
  localStorage.inspectorState = JSON.stringify(state);
}

const debouncedSaveState = debounce(saveState, 100);

function App({
  entity,
  runLoop,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
}) {
  let ent = entity;

  return (
    <StateTreeProvider
      initialValue={initialState}
      onUpdate={debouncedSaveState}
    >
      <div
        style={{
          fontFamily: "Menlo, monospace",
          fontSize: 11,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <StateKey value="timeControls">
          {runLoop ? <TimeControls runLoop={runLoop} /> : null}
        </StateKey>
        <StateKey value="tree">
          <div style={{ flexBasis: "100%" }}>
            <Tree
              data={ent}
              setValue={(newEnt) => {
                ent = newEnt;
              }}
            />
          </div>
        </StateKey>
      </div>
    </StateTreeProvider>
  );
}

function defaultElement(): HTMLElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "33vw",
    opacity: "0.8",
    overflow: "auto",
    backgroundColor: "white",
  });
  document.body.appendChild(el);
  return el;
}

export default function Inspector({
  el = defaultElement(),
  pauseOnStart = false,
}: Partial<{
  el: HTMLElement;
  pauseOnStart: boolean;
}> = {}) {
  let hasPausedOnStart = false;

  const tick = useCallbackAsCurrent(() => {
    const entity = useRootEntity();
    const runLoop = entity.getComponent(Components.RunLoop);
    if (runLoop && pauseOnStart && !hasPausedOnStart) {
      runLoop.pause();
      hasPausedOnStart = true;
    }

    ReactDOM.render(<App entity={entity} runLoop={runLoop} />, el);

    requestAnimationFrame(tick);
  });

  tick();
}
