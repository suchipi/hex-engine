import React from "react";
import { Components } from "@hex-engine/core";
import Button from "./Button";
import { ResumeIcon, StepIcon, PauseIcon } from "./Icons";

type RunLoopAPI = ReturnType<typeof Components.RunLoop>;

export default function TimeControls({ runLoop }: { runLoop: RunLoopAPI }) {
  const error = runLoop.error;
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: error ? "#ff9a9a" : "#eee",
        padding: 2,
      }}
    >
      {runLoop.isPaused() ? (
        <>
          <Button
            onClick={() => {
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
    </div>
  );
}
