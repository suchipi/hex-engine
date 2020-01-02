import React from "react";
import { Entity, Components } from "@hex-engine/core";
import { StateKey, useStateTree } from "react-state-tree";
import Tree from "./Tree";
import Controls from "./Controls";

type RunLoopAPI = ReturnType<typeof Components.RunLoop>;

export default function App({
  entity,
  runLoop,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
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
        }}
      >
        <StateKey value="controls">
          {runLoop ? (
            <Controls
              isOpen={open}
              toggleOpen={() => setOpen(!open)}
              runLoop={runLoop}
            />
          ) : null}
        </StateKey>
      </div>
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "33vw",
          overflow: "auto",
          backgroundColor: "white",
          transform: open ? "translate(0, 0)" : "translate(33vw, 0)",
          boxShadow: open ? "0px 0px 10px rgba(0, 0, 0, 0.5)" : "",
          transition: "all 0.2s ease-in-out",

          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <StateKey value="controls">
          {runLoop ? (
            <Controls
              isOpen={open}
              toggleOpen={() => setOpen(!open)}
              runLoop={runLoop}
            />
          ) : null}
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
    </div>
  );
}
