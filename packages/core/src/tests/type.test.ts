import { createRoot, useType } from "..";

test("type gets set from component type", () => {
  function Something() {
    useType(Something);
  }

  const ent = createRoot(Something);

  expect(ent.rootComponent.type).toBe(Something);
});

test("type remains unset if they don't use useType", () => {
  function Something() {}

  const ent = createRoot(Something);

  expect(ent.rootComponent.type).toBe(null);
});

test("default entity name comes from root component type", () => {
  function Something() {
    useType(Something);
  }

  const ent = createRoot(Something);

  expect(ent.name).toBe("Something");
});

test("no default entity name if they don't use useType", () => {
  function Something() {}

  const ent = createRoot(Something);

  expect(ent.name).toBe(null);
});
