import React from "preact/compat";
import { RunLoop } from "@hex-engine/core";
import Button from "./Button";
import {
  ResumeIcon,
  StepIcon,
  PauseIcon,
  PaneRightIcon,
  PaneLeftIcon,
  PickEntityIcon,
  MinimizeIcon,
} from "./Icons";

type RunLoopAPI = ReturnType<typeof RunLoop>;

export default function Controls({
  runLoop,
  error,
  isOpen,
  toggleOpen,
  isSelectMode,
  toggleSelectMode,
  collapseTree,
}: {
  runLoop: RunLoopAPI;
  error: Error | null;
  isOpen: boolean;
  toggleOpen: () => void;
  isSelectMode: boolean;
  toggleSelectMode: () => void;
  collapseTree: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: error ? "#ff9a9a" : "#eee",
        padding: 2,
      }}
    >
      <Button
        title="Pick an entity from the canvas"
        onClick={toggleSelectMode!}
      >
        <span
          style={{ padding: 4, color: `${isSelectMode ? "#008eff" : "#222"}` }}
        >
          <PickEntityIcon />
        </span>
      </Button>
      {isOpen && (
        <Button title="Collapse Inspector Tree" onClick={collapseTree}>
          <span
            style={{
              padding: 4,
              color: "#222",
            }}
          >
            <MinimizeIcon />
          </span>
        </Button>
      )}
      {runLoop.isPaused() ? (
        <>
          <Button
            onClick={() => {
              localStorage.inspectorPauseOnStart = "false";
              runLoop.resume();
            }}
            title="Resume execution"
          >
            <span style={{ padding: 4, color: "#008eff" }}>
              <ResumeIcon />
            </span>
          </Button>
          <Button
            onClick={() => {
              runLoop.step();
            }}
            title="Run one frame"
          >
            <span style={{ padding: 4, color: "#222" }}>
              <StepIcon />
            </span>
          </Button>
        </>
      ) : (
        <Button
          onClick={() => {
            localStorage.inspectorPauseOnStart = "true";
            runLoop.pause();
          }}
          title="Pause execution"
        >
          <span style={{ padding: 4, color: "#222" }}>
            <PauseIcon />
          </span>
        </Button>
      )}

      <div style={{ flexGrow: 1 }} />

      <div style={{ padding: 4 }}>
        {runLoop.isPaused()
          ? error
            ? `Paused due to ${error.name}: ${error.message} (check console for more info)`
            : `Paused (frame ${runLoop.frameNumber})`
          : "Running"}
      </div>

      {isOpen ? (
        <Button onClick={toggleOpen} title="Hide inspector pane">
          <span style={{ padding: 6, color: "#222" }}>
            <PaneRightIcon />
          </span>
        </Button>
      ) : (
        <Button onClick={toggleOpen} title="Show inspector pane">
          <span style={{ padding: 6, color: "#222" }}>
            <PaneLeftIcon />
          </span>
        </Button>
      )}
    </div>
  );
}
