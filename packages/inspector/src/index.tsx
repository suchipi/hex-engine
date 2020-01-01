import React from "react";
import ReactDOM from "react-dom";
import { Entity, useFrame, useName, createEntity } from "@hex-engine/core";
import Tree from "./Tree";

function App({ entity }: { entity: Entity }) {
  return (
    <div
      style={{
        fontFamily: "Menlo, monospace",
        fontSize: 11,
        padding: 4,
      }}
    >
      <Tree data={entity} />
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
    opacity: "0.66",
    overflow: "auto",
  });
  document.body.appendChild(el);
  return el;
}

export default function inspect(
  entity: Entity,
  el: HTMLElement = defaultElement()
) {
  function Inspector() {
    useName("inspector");
    useFrame(() => {
      ReactDOM.render(<App entity={entity} />, el);
    });
  }

  const inspector = createEntity(Inspector);
  entity.addChild(inspector);
}
