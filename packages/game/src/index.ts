import { createEntityWithComponent } from "@hex-engine/2d";
import Root from "./Components/Root";

const root = createEntityWithComponent(Root);

// @ts-ignore
window.root = root;
