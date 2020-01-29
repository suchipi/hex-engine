import React from "react";
import { Entity, RunLoop } from "@hex-engine/core";
import { StateKey, useStateTree } from "react-state-tree";
import Tree from "./Tree";
import Controls from "./Controls";
import PausedOverlay from "./PausedOverlay";

type RunLoopAPI = ReturnType<typeof RunLoop>;

export default function App({
  entity,
  runLoop,
  error,
  isHovered,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
  error: Error | null;
  isHovered: boolean;
}) {
  let ent = entity;

  const [open, setOpen] = useStateTree(false, "open");

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
        <StateKey value="controls">
          {runLoop && !open ? (
            <Controls
              isOpen={open}
              toggleOpen={() => setOpen(!open)}
              runLoop={runLoop}
              error={error}
            />
          ) : null}
        </StateKey>
      </div>
      {runLoop && runLoop.isPaused() && runLoop.frameNumber === 0 ? (
        <PausedOverlay runLoop={runLoop} />
      ) : null}
      {open ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "33vw",
            overflow: "auto",
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
          <StateKey value="controls">
            {runLoop ? (
              <Controls
                isOpen={open}
                toggleOpen={() => setOpen(!open)}
                runLoop={runLoop}
                error={error}
              />
            ) : null}
          </StateKey>
          <StateKey value="tree">
            <div style={{ flexBasis: "100%" }}>
              <Tree name="root" data={ent} parent={null} />
            </div>
          </StateKey>
        </div>
      ) : null}
    </div>
  );
}
