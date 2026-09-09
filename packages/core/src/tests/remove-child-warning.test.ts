/// <reference types="@test-it/core/globals" />
import { Entity, createRoot, useChild, useType } from "..";

function Plain() {
  useType(Plain);
}

// Entity.removeChild schedules its "was this leaked?" check a second later, so
// this file has to wait out a real timer. It is kept on its own so that the
// wait is paid once.
test("known quirk: re-parenting warns about a leak, while destroying does not", async () => {
  let reParented!: Entity;
  let destroyed!: Entity;
  let newParent!: Entity;

  createRoot(function Root() {
    useType(Root);

    const oldParent = useChild(function Old() {
      useType(Old);
    });
    newParent = useChild(function New() {
      useType(New);
    });

    reParented = oldParent.createChild(Plain);
    destroyed = oldParent.createChild(Plain);
  });

  const warnings: Array<Array<unknown>> = [];
  const realWarn = console.warn;
  console.warn = (...args: Array<unknown>) => {
    warnings.push(args);
  };

  try {
    newParent.takeChild(reParented);
    destroyed.destroy();

    expect(reParented.parent).toBe(newParent);

    await new Promise((resolve) => setTimeout(resolve, 1300));
  } finally {
    console.warn = realWarn;
  }

  const about = (entity: Entity) =>
    warnings.filter((args) => args.includes(entity));

  // The warning only checks whether the child was destroyed, so giving it a new
  // parent -- which its own message suggests as the alternative -- still warns.
  expect(about(reParented).length).toBe(1);
  expect(String(about(reParented)[0][0])).toContain(
    "wasn't destroyed within 1 second"
  );

  expect(about(destroyed).length).toBe(0);
});
