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
import useInspectorSelect from "./useInspectorSelect";

type RunLoopAPI = ReturnType<typeof RunLoop>;

interface SelectModeState {
  getSelectMode: () => boolean;
  toggleSelectMode: () => void;
}

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
  selectModeStateHolder,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
  stateHolder: {
    err: Error | null;
    forceUpdate: null | (() => void);
    isHovered: boolean;
  };
  selectModeStateHolder: SelectModeState;
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
        isSelectMode={selectModeStateHolder.getSelectMode()}
        toggleSelectMode={selectModeStateHolder.toggleSelectMode}
      />
    </StateTreeProvider>
  );
}

/**
 * A Component function that renders an Inspector overlay onto the page,
 * that shows you information about the current Entity tree, and allows you
 * to tweak values and pause/resume/step frame execution.
 *
 * It stores its state (which things are opened, whether you are paused, etc)
 * in localStorage, so that state persists across page refreshes.
 *
 * Note that the Inspector is pretty performance-heavy while open.
 *
 * Since the Inspector lowers the framerate while open, and allows you to
 * tweak Component and Entity values arbitrarily, you probably don't want
 * to include it in your final game release.
 */
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

  let isSelectMode = false;

  const selectModeStateHolder: SelectModeState = {
    getSelectMode: () => isSelectMode,
    toggleSelectMode: () => (isSelectMode = !isSelectMode),
  };

  useNewComponent(() =>
    ErrorBoundary((err) => {
      console.error(err, err.stack);
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
    <Root
      entity={entity}
      runLoop={runLoop}
      stateHolder={stateHolder}
      selectModeStateHolder={selectModeStateHolder}
    />,
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

  return {
    ...selectModeStateHolder,
  };
}

export { useInspectorHover, useInspectorSelect };
