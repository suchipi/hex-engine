import { renderRootComponent } from "@hex-engine/2d";
import Root from "./Components/Root";

const root = renderRootComponent(Root);

// @ts-ignore
window.root = root;
