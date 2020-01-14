import { createRoot } from "@hex-engine/2d";
import Root from "./Components/Root";

const root = createRoot(Root);

// @ts-ignore
window.root = root;
