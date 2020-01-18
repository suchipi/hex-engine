import { createRoot } from "@hex-engine/2d";
import Root from "./Root";

const rootEntity = createRoot(Root);

// @ts-ignore
window.rootEntity = rootEntity;
