import React from "inferno-compat";
import { RunLoop } from "@hex-engine/core";
import Button from "./Button";
import { ResumeIcon } from "./Icons";

type RunLoopAPI = ReturnType<typeof RunLoop>;

export default function PausedOverlay({ runLoop }: { runLoop: RunLoopAPI }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "calc(50vh - 64px)",
        left: "calc(50vw - 64px)",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      }}
    >
      <div
        style={{
          width: "128px",
          height: "128px",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",

          "box-shadow": "0px 0px 10px rgba(0, 0, 0, 0.5)",
          "background-color": "rgba(238, 238, 238)",
          "border-radius": "16px",
        }}
      >
        <Button
          onClick={() => {
            localStorage.inspectorPauseOnStart = "false";
            runLoop.resume();
          }}
          title="Resume execution"
          style={{
            color: "#008eff",
          }}
        >
          <ResumeIcon width={128} height={128} />
        </Button>
      </div>
    </div>
  );
}
