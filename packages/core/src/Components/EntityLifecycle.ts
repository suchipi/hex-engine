import HooksSystem from "../HooksSystem";

const {
  useType,
  useStateAccumlator,
  useCallbackAsCurrent,
  useExistingComponentByType,
  useNewComponent,
} = HooksSystem.hooks;

type LifecycleCallback = () => void;
const ADDED_TO_PARENT = Symbol("ADDED_TO_PARENT");
const REMOVED_FROM_PARENT = Symbol("REMOVED_FROM_PARENT");

export default function EntityLifecycle() {
  useType(EntityLifecycle);

  const addedToParentState = useStateAccumlator<LifecycleCallback>(
    ADDED_TO_PARENT
  );
  const removedFromParentState = useStateAccumlator<LifecycleCallback>(
    REMOVED_FROM_PARENT
  );

  return {
    entityApi: {
      performAddedToParent: () => {
        addedToParentState.all().forEach((callback) => callback());
      },
      performRemovedFromParent: () => {
        addedToParentState.all().forEach((callback) => callback());
      },
    },

    onAddedToParent: (callback: LifecycleCallback) => {
      addedToParentState.add(useCallbackAsCurrent(callback));
    },
    onRemovedFromParent: (callback: LifecycleCallback) => {
      removedFromParentState.add(useCallbackAsCurrent(callback));
    },
  };
}

export function useEntityLifecycle(
  callbacks: Partial<{
    onAddedToParent: LifecycleCallback;
    onRemovedFromParent: LifecycleCallback;
  }> = {}
) {
  const entityLifecycle =
    useExistingComponentByType(EntityLifecycle) ||
    useNewComponent(EntityLifecycle);

  if (callbacks.onAddedToParent) {
    entityLifecycle.onAddedToParent(callbacks.onAddedToParent);
  }
  if (callbacks.onRemovedFromParent) {
    entityLifecycle.onRemovedFromParent(callbacks.onRemovedFromParent);
  }
}
