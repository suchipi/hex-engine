import { createElement } from "preact";
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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "128px",
          height: "128px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
          backgroundColor: "rgba(238, 238, 238)",
          borderRadius: "16px",
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
