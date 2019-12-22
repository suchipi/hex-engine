import Scene from "./Scene";

export default interface PresentsScenes {
  activeScene: Scene | null;
  present(scene: Scene): void;
}
