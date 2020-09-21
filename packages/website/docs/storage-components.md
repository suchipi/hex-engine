---
title: Storage Components
---

In the Hex Engine's codebase, there are a lot of components whose names start with "StorageFor", which are used to store state or references to entities on the root entity. They're used to share and coordinate state throughout your game.

The idea is that you create a component that holds some state, and attach it to the root entity. Then, when you want to get that state, you use `useRootEntity().getComponent`.

The reason you're able to store state in a component and access it later is because if you return an object from a component function, getters and setters for that object's properties get copied onto the component instance, as returned by `Entity.getComponent`.

In this example, I model a "quest list", like you'd find in an MMORPG. The list of accepted quests is stored in the `QuestListState` component. The `QuestListUI` component renders all the quests. The `AcceptQuest` component adds a quest to the list.

```ts
type Quest = {
  name: string;
  description: string;
};

function QuestListState() {
  useType(QuestListState);

  const quests: Array<Quest> = [];

  return { quests };
}

function QuestListUI() {
  useType(QuestListUI);

  useDraw((context) => {
    const questListState = useRootEntity().getComponent(QuestListState);
    if (questListState) {
      const quests = questListState.quests;

      quests.forEach((quest) => {
        // use `context` to render the quest text to the screen
      });
    }
  });
}

function AcceptQuest(quest: Quest) {
  useType(AcceptQuest);

  // add a geometry component and render a button

  const mouse = useNewComponent(Mouse);
  mouse.onClick(() => {
    const questListState = useRootEntity().getComponent(QuestListState);

    if (questListState) {
      const quests = questListState.quests;

      quests.push(quest);
    }
  });
}

function Root() {
  useType(Root);

  useNewComponent(QuestListState);
  useNewComponent(QuestListUI);
  useNewComponent(() =>
    AcceptQuest({ name: "Do the thing", description: "Yes" })
  );
}
```

To avoid needing to remember to put `QuestListState` on `Root`, you can use [useNewRootComponent](https://hex-engine.dev/docs/api-core#usenewrootcomponent) to initialize it the first time it is used:

```ts
const questListState =
  useRootEntity().getComponent(QuestListState) ||
  useNewRootComponent(QuestListState);
const quests = questListState.quests;
```

Then, you can put that into a hook, and use it wherever you need the quest list:

```ts
function useQuestList() {
  const questListState =
    useRootEntity().getComponent(QuestListState) ||
    useNewRootComponent(QuestListState);
  const quests = questListState.quests;
  return quests;
}
```

That simplifies the original code to:

```ts
type Quest = {
  name: string;
  description: string;
};

function QuestListState() {
  useType(QuestListState);

  const quests: Array<Quest> = [];

  return { quests };
}

function useQuestList() {
  const questListState =
    useRootEntity().getComponent(QuestListState) ||
    useNewRootComponent(QuestListState);
  const quests = questListState.quests;
  return quests;
}

function QuestListUI() {
  useType(QuestListUI);

  useDraw((context) => {
    const quests = useQuestList();

    quests.forEach((quest) => {
      // use `context` to render the quest text to the screen
    });
  });
}

function AcceptQuest(quest: Quest) {
  useType(AcceptQuest);

  // add a geometry component and render a button

  const mouse = useNewComponent(Mouse);
  mouse.onClick(() => {
    const quests = useQuestList();
    quests.push(quest);
  });
}

function Root() {
  useType(Root);

  useNewComponent(QuestListUI);
  useNewComponent(() =>
    AcceptQuest({ name: "Do the thing", description: "Yes" })
  );
}
```
