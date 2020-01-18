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
import useInspectorHover from "./useInspectorHover";

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
  stateHolder,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
  stateHolder: {
    err: Error | null;
    forceUpdate: null | (() => void);
    isHovered: boolean;
  };
}) {
  const forceUpdate = useForceUpdate();

  stateHolder.forceUpdate = forceUpdate;

  return (
    <StateTreeProvider
      initialValue={initialState}
      onUpdate={debouncedSaveState}
    >
      <App
        entity={entity}
        runLoop={runLoop}
        error={stateHolder.err}
        isHovered={stateHolder.isHovered}
      />
    </StateTreeProvider>
  );
}

export default function Inspector() {
  useType(Inspector);

  const pauseOnStart = localStorage.inspectorPauseOnStart === "true";

  const entity = useRootEntity();
  const runLoop = entity.getComponent(RunLoop);

  const stateHolder: {
    err: Error | null;
    forceUpdate: null | (() => void);
    isHovered: boolean;
  } = {
    err: null,
    forceUpdate: null,
    isHovered: false,
  };

  useNewComponent(() =>
    ErrorBoundary((err) => {
      console.error(err);
      stateHolder.err = err;

      runLoop?.pause();
      if (stateHolder.forceUpdate) {
        stateHolder.forceUpdate();
      }
    })
  );

  let hasPausedOnStart = false;

  const el = document.createElement("div");
  document.body.appendChild(el);

  const { onHoverStart, onHoverEnd } = useInspectorHover();
  onHoverStart(() => {
    stateHolder.isHovered = true;
    if (stateHolder.forceUpdate) stateHolder.forceUpdate();
  });
  onHoverEnd(() => {
    stateHolder.isHovered = false;
    if (stateHolder.forceUpdate) stateHolder.forceUpdate();
  });

  ReactDOM.render(
    <Root entity={entity} runLoop={runLoop} stateHolder={stateHolder} />,
    el,
    useCallbackAsCurrent(() => {
      const tick = useCallbackAsCurrent(() => {
        if (runLoop && pauseOnStart && !hasPausedOnStart) {
          runLoop.pause();
          hasPausedOnStart = true;
        }

        if (stateHolder.forceUpdate != null) {
          stateHolder.forceUpdate();
        }

        requestAnimationFrame(tick);
      });

      tick();
    })
  );
}

export { useInspectorHover };
