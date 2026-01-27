import React from "inferno-compat";
import { Entity, RunLoop } from "@hex-engine/core";
import Tree from "./Tree";
import Controls from "./Controls";
import PausedOverlay from "./PausedOverlay";

type RunLoopAPI = ReturnType<typeof RunLoop>;

export default function App({
  entity,
  runLoop,
  error,
  onExpand,
  getExpanded,
  getSelectedEntity,
  isHovered,
  isOpen,
  toggleOpen,
  isSelectMode,
  toggleSelectMode,
  collapseTree,
}: {
  entity: Entity;
  getSelectedEntity: () => null | Entity;
  runLoop: RunLoopAPI | null;
  error: Error | null;
  onExpand: (path: Array<string | number>, expand: boolean) => void;
  getExpanded: (path: Array<string | number>) => boolean;
  isHovered: boolean;
  isOpen: boolean;
  toggleOpen: () => void;
  isSelectMode: boolean;
  toggleSelectMode: () => void;
  collapseTree: () => void;
}) {
  let ent = entity;

  return (
    <div
      style={{
        "font-family": "Menlo, monospace",
        "font-size": "11",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          "border-bottom-left-radius": "4px",
          overflow: "hidden",
          "box-shadow": "0px 0px 10px rgba(0, 0, 0, 0.5)",
          ...(isHovered
            ? {
                "outline-style": "auto",
                "outline-color": "magenta",
              }
            : null),
        }}
      >
        {runLoop && !isOpen ? (
          <Controls
            isSelectMode={isSelectMode}
            toggleSelectMode={toggleSelectMode}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            runLoop={runLoop}
            error={error}
            collapseTree={collapseTree}
          />
        ) : null}
      </div>
      {runLoop && runLoop.isPaused() && runLoop.frameNumber === 0 ? (
        <PausedOverlay runLoop={runLoop} />
      ) : null}
      {isOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "33vw",
            "background-color": "rgba(255, 255, 255, 0.75)",
            "box-shadow": "0px 0px 10px rgba(0, 0, 0, 0.5)",
            display: "flex",
            "flex-direction": "column",
            height: "100%",
            "box-sizing": "border-box",

            ...(isHovered
              ? {
                  "outline-style": "auto",
                  "outline-color": "magenta",
                }
              : null),
          }}
        >
          {runLoop ? (
            <Controls
              isSelectMode={isSelectMode}
              toggleSelectMode={toggleSelectMode}
              isOpen={isOpen}
              toggleOpen={toggleOpen}
              runLoop={runLoop}
              error={error}
              collapseTree={collapseTree}
            />
          ) : null}
          <div style={{ "flex-basis": "100%", "overflow-y": "auto" }}>
            <Tree
              name="root"
              data={ent}
              parent={null}
              path={["root"]}
              onExpand={onExpand}
              getExpanded={getExpanded}
              getSelectedEntity={getSelectedEntity}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
