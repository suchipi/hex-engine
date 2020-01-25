import { createRoot, useEntityName, useNewComponent } from "..";

test("name set", () => {
  function Something() {
    useEntityName("Bob");
  }

  const ent = createRoot(Something);

  expect(ent.name).toBe("Bob");
});

test("name get", () => {
  function Something() {
    useEntityName("Bob");
  }

  let name: string | null = null;
  createRoot(() => {
    useNewComponent(Something);

    useNewComponent(() => {
      name = useEntityName();
    });
  });

  expect(name).toBe("Bob");
});
