import React from "react";
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
}) {
  let ent = entity;

  return (
    <div
      style={{
        fontFamily: "Menlo, monospace",
        fontSize: 11,
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          borderBottomLeftRadius: "4px",
          overflow: "hidden",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
          ...(isHovered
            ? {
                outlineStyle: "auto",
                outlineColor: "magenta",
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
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",

            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",

            ...(isHovered
              ? {
                  outlineStyle: "auto",
                  outlineColor: "magenta",
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
            />
          ) : null}
          <div style={{ flexBasis: "100%", overflow: "auto" }}>
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
