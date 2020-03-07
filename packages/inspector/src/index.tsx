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
import debounce from "lodash.debounce";
import setWith from "lodash.setwith";
import get from "lodash.get";
import useForceUpdate from "use-force-update";
import App from "./App";
import useInspectorHover from "./useInspectorHover";
import useInspectorSelect from "./useInspectorSelect";

type RunLoopAPI = ReturnType<typeof RunLoop>;

interface StateHolder {
  tree: any;
  setExpanded: (path: Array<string | number>, expand) => void;
  getExpanded: (path: Array<string | number>) => boolean;
  err: Error | null;
  forceUpdate: null | (() => void);
  isHovered: boolean;
  getIsOpen: () => boolean;
  toggleOpen: () => void;
  getSelectMode: () => boolean;
  toggleSelectMode: () => void;
  getSelectedEntity: () => null | Entity;
  selectEntity: (entity: Entity) => void;
  collapseTree: () => void;
}

const initialInspectorTree = localStorage.inspectorTree
  ? JSON.parse(localStorage.inspectorTree)
  : { root: {} };

function saveTree(tree: any) {
  localStorage.inspectorTree = JSON.stringify(tree);
}

const debouncedSaveTree = debounce(saveTree, 100);

function getRootToEntityPath(entity: Entity): Array<string | number> {
  const path: Array<string | number> = [];
  let ent = entity;

  while (ent.parent) {
    const idx = [...ent.parent.children].indexOf(ent);
    path.push(idx, "children");
    ent = ent.parent;
  }

  path.push("root");
  path.reverse();
  return path;
}

function Root({
  entity,
  runLoop,
  stateHolder,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
  stateHolder: StateHolder;
}) {
  const forceUpdate = useForceUpdate();

  stateHolder.forceUpdate = forceUpdate;

  return (
    <App
      entity={entity}
      getSelectedEntity={stateHolder.getSelectedEntity}
      runLoop={runLoop}
      error={stateHolder.err}
      getExpanded={stateHolder.getExpanded}
      onExpand={stateHolder.setExpanded}
      isHovered={stateHolder.isHovered}
      isOpen={stateHolder.getIsOpen()}
      toggleOpen={stateHolder.toggleOpen}
      isSelectMode={stateHolder.getSelectMode()}
      toggleSelectMode={stateHolder.toggleSelectMode}
      collapseTree={stateHolder.collapseTree}
    />
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
  const rootEntity = useRootEntity();
  const runLoop = rootEntity.getComponent(RunLoop);

  let isOpen = localStorage.inspectorOpen === "true";
  let isSelectMode = false;
  let tree = initialInspectorTree;
  let selectedEntity: null | Entity = null;

  const stateHolder: StateHolder = {
    tree,
    setExpanded: (path: Array<string | number>, expand: boolean) => {
      if (expand) {
        setWith(tree, path, {}, Object);
      } else {
        const key = path.pop();

        // lodash.get(obj, []) does not return obj. We need to test if we
        // reached the root and manually collapse it
        if (key === "root") {
          stateHolder.collapseTree();
        } else {
          const subtree = get(tree, path);
          delete subtree[key!];
        }
      }

      debouncedSaveTree(tree);
    },
    getExpanded: (path: Array<string | number>) => {
      return get(tree, path) !== undefined;
    },
    collapseTree: () => {
      tree.root = {};
    },
    err: null,
    forceUpdate: null,
    isHovered: false,
    getIsOpen: () => isOpen,
    toggleOpen: () => {
      isOpen = !isOpen;
      localStorage.inspectorOpen = isOpen;
    },
    getSelectMode: () => isSelectMode,
    toggleSelectMode: () => (isSelectMode = !isSelectMode),
    getSelectedEntity: () => selectedEntity,
    selectEntity: (entity: Entity) => {
      if (!stateHolder.getIsOpen()) {
        stateHolder.toggleOpen();
      }

      const entityPath = getRootToEntityPath(entity);
      stateHolder.setExpanded(entityPath, true);
      selectedEntity = entity;
    },
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
    <Root entity={rootEntity} runLoop={runLoop} stateHolder={stateHolder} />,
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

  const { getSelectMode, toggleSelectMode, selectEntity } = stateHolder;
  const inspectorSelectApi = {
    getSelectMode,
    toggleSelectMode,
    selectEntity,
  };

  return {
    ...inspectorSelectApi,
  };
}

export { useInspectorHover, useInspectorSelect };
