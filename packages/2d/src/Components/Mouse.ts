import {
  useType,
  useNewComponent,
  useCallbackAsCurrent,
  useEntity,
  Entity,
} from "@hex-engine/core";
import LowLevelMouse, { HexMouseEvent } from "./LowLevelMouse";
import MousePosition from "./MousePosition";
import Geometry from "./Geometry";

type Callback = (event: HexMouseEvent) => void;

/**
 * A Component that gives you information about where the Mouse is, relative to the current Entity,
 * and lets you register functions to be called when the mouse cursor interacts with the current Entity.
 */
export default function Mouse({
  entity = useEntity(),
  geometry = entity.getComponent(Geometry),
}: {
  /**
   * The entity that this Mouse Component should give information about and relative to.
   * If not provided, it will use the current Entity.
   */
  entity?: Entity | undefined;
  /**
   * The Geometry Component that this Mouse should use to identify whether the cursor
   * is inside the Entity or not. If not provided, it will attempt to get a Geometry
   * component off of the Entity.
   */
  geometry?: ReturnType<typeof Geometry> | null;
} = {}) {
  useType(Mouse);

  if (process.env.NODE_ENV !== "production") {
    if (!geometry) {
      console.warn(
        "Attempted to create a Mouse component with no associated Geometry. This Mouse component will not be useful.\nPlease either add a Geometry to the Entity before constructing the Mouse component, pass a Geometry into the Mouse component function, or use LowLevelMouse instead (which doesn't rely on Geometry).\nThis message will not be logged in production."
      );
    }
  }

  const storage = {
    onDownCallbacks: new Set<Callback>(),
    onUpCallbacks: new Set<Callback>(),
    onClickCallbacks: new Set<Callback>(),
    onRightClickCallbacks: new Set<Callback>(),
    onMiddleClickCallbacks: new Set<Callback>(),
  };

  const { onMouseDown, onMouseUp } = useNewComponent(LowLevelMouse);
  const mousePosition = useNewComponent(() =>
    MousePosition({ entity, geometry })
  );

  let pressingLeft = false;
  let pressingRight = false;
  let pressingMiddle = false;

  onMouseDown((event) => {
    if (!mousePosition.isInsideBounds) return;
    const { buttons } = event;

    if (buttons.left) {
      pressingLeft = true;
      storage.onDownCallbacks.forEach((callback) => callback(event));
    }
    if (buttons.right) {
      pressingRight = true;
    }
    if (buttons.middle) {
      pressingMiddle = true;
    }
  });

  onMouseUp((event) => {
    const { buttons } = event;

    if (mousePosition.isInsideBounds) {
      if (pressingLeft && buttons.left) {
        storage.onClickCallbacks.forEach((callback) => callback(event));
      }
      if (pressingRight && buttons.right) {
        storage.onRightClickCallbacks.forEach((callback) => callback(event));
      }
      if (pressingMiddle && buttons.middle) {
        storage.onMiddleClickCallbacks.forEach((callback) => callback(event));
      }
    }

    if (buttons.left) {
      pressingLeft = false;
      storage.onUpCallbacks.forEach((callback) => callback(event));
    }
    if (buttons.right) {
      pressingRight = false;
    }
    if (buttons.middle) {
      pressingMiddle = false;
    }
  });

  const callbackSetters = {
    onDown(callback: (event: HexMouseEvent) => void) {
      storage.onDownCallbacks.add(useCallbackAsCurrent(callback));
    },
    onUp(callback: (event: HexMouseEvent) => void) {
      storage.onUpCallbacks.add(useCallbackAsCurrent(callback));
    },
    onClick(callback: (event: HexMouseEvent) => void) {
      storage.onClickCallbacks.add(useCallbackAsCurrent(callback));
    },
    onRightClick(callback: (event: HexMouseEvent) => void) {
      storage.onRightClickCallbacks.add(useCallbackAsCurrent(callback));
    },
    onMiddleClick(callback: (event: HexMouseEvent) => void) {
      storage.onMiddleClickCallbacks.add(useCallbackAsCurrent(callback));
    },
  };

  return {
    /**
     * A boolean indicating whether the mouse cursor is currently within the Entity, according
     * to the Shape on the Geometry this Component has been configured to use.
     */
    get isInsideBounds() {
      return mousePosition.isInsideBounds;
    },

    /**
     * A boolean indicating whether the left mouse button is currently being pressed.
     */
    get isPressingLeft() {
      return pressingLeft;
    },
    /**
     * A boolean indicating whether the right mouse button is currently being pressed.
     */
    get isPressingRight() {
      return pressingRight;
    },
    /**
     * A boolean indicating whether the middle mouse button is currently being pressed.
     */
    get isPressingMiddle() {
      return pressingMiddle;
    },

    /**
     * The current position of the mouse cursor, relative to the Entity this Component has been
     * configured to use.
     */
    get position() {
      return mousePosition.position;
    },

    /**
     * Registers a function to be called when the mouse cursor enters the configured Entity's bounds.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onEnter() {
      return mousePosition.onEnter;
    },

    /**
     * Registers a function to be called whenever the mouse cursor moves,
     * *even if it is not within the Entity's bounds*.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onMove() {
      return mousePosition.onMove;
    },

    /**
     * Registers a function to be called whenever the mouse cursor exits the configured Entity's bounds.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onLeave() {
      return mousePosition.onLeave;
    },

    /**
     * Registers a function to be called whenever the _LEFT_ mouse button is pressed down
     * within the configured Entity's bounds.
     *
     * If you need an onDown event for a mouse button other than the left button, you will
     * have to use the `LowLevelMouse` Component instead.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onDown() {
      return callbackSetters.onDown;
    },

    /**
     * Registers a function to be called whenever the _LEFT_ mouse button is released
     * within the configured Entity's bounds.
     *
     * If you need an onDown onUp for a mouse button other than the left button, you will
     * have to use the `LowLevelMouse` Component instead.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onUp() {
      return callbackSetters.onUp;
    },

    /**
     * Registers a function to be called whenever the left mouse button is pressed
     * and then released within the configured Entity's bounds.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onClick() {
      return callbackSetters.onClick;
    },

    /**
     * Registers a function to be called whenever the right mouse button is pressed
     * and then released within the configured Entity's bounds.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onRightClick() {
      return callbackSetters.onRightClick;
    },

    /**
     * Registers a function to be called whenever the middle mouse button is pressed
     * and then released within the configured Entity's bounds.
     *
     * The function will be called with a `HexMouseEvent`.
     */
    get onMiddleClick() {
      return callbackSetters.onMiddleClick;
    },
  };
}
