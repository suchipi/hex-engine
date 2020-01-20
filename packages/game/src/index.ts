import * as hex from "@hex-engine/2d";
import Root from "./Root";

const rootEntity = hex.createRoot(Root);

// @ts-ignore
window.rootEntity = rootEntity;

// @ts-ignore
window.hex = hex;
