import React from "react";
import ReactDOM from "react-dom";
import {
  Entity,
  useName,
  createEntity,
  useRootEntity,
  useCallbackAsCurrent,
  Components,
} from "@hex-engine/core";
import Tree from "./Tree";
import TimeControls from "./TimeControls";

type RunLoopAPI = ReturnType<typeof Components.RunLoop>;

function App({
  entity,
  runLoop,
}: {
  entity: Entity;
  runLoop: RunLoopAPI | null;
}) {
  return (
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
      {runLoop ? <TimeControls runLoop={runLoop} /> : null}
      <div style={{ flexBasis: "100%" }}>
        <Tree data={entity} />
      </div>
    </div>
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

export default function inspect(
  entity: Entity,
  {
    el = defaultElement(),
    pauseOnStart = false,
  }: Partial<{
    el: HTMLElement;
    pauseOnStart: boolean;
  }> = {}
) {
  function Inspector() {
    useName("inspector");

    let hasPausedOnStart = false;

    const tick = useCallbackAsCurrent(() => {
      const runLoop = useRootEntity().getComponent(Components.RunLoop);
      if (runLoop && pauseOnStart && !hasPausedOnStart) {
        runLoop.pause();
        hasPausedOnStart = true;
      }

      ReactDOM.render(<App entity={entity} runLoop={runLoop} />, el);

      requestAnimationFrame(tick);
    });

    tick();
  }

  const inspector = createEntity(Inspector);
  entity.addChild(inspector);
}
