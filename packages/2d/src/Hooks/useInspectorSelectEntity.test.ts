/// <reference types="@test-it/core/globals" />
import { Entity, useChild, useNewComponent, useType } from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";
import Geometry from "../Components/Geometry";
import Mouse from "../Components/Mouse";
import { Polygon, Vector } from "../Models";
import {
  endGame,
  mouseDown,
  mouseMove,
  mouseUp,
  startGame,
  step,
} from "../Components/inputTestSetup";

afterEach(endGame);

const BOX_POSITION = new Vector(100, 100);

function startWithSelectableBox() {
  let entity!: Entity;
  let root!: Entity;

  root = startGame(() => {
    entity = useChild(function Selectable() {
      useType(Selectable);

      // Geometry calls useInspectorSelectEntity for itself.
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: BOX_POSITION,
        })
      );
    });
  });

  const inspector = root.getComponent(Inspector);
  if (!inspector) throw new Error("no Inspector on the root Entity");
  inspector.hide();

  return { entity, root, inspector };
}

/** Clicks on the Entity, one event per frame so the press is not dropped. */
function clickOn(x: number, y: number) {
  mouseMove(x, y);
  step();
  mouseDown(x, y, 0);
  step();
  mouseUp(x, y, 0);
  step();
}

test("a Geometry gives its Entity a Mouse so the Inspector can select it", () => {
  const { entity } = startWithSelectableBox();

  expect(entity.hasComponent(Mouse)).toBe(true);
});

test("select mode starts off", () => {
  const { inspector } = startWithSelectableBox();

  expect(inspector.getSelectMode()).toBe(false);
});

test("clicking an Entity while select mode is off does not select it", () => {
  const { inspector } = startWithSelectableBox();

  clickOn(BOX_POSITION.x, BOX_POSITION.y);

  expect(inspector.getSelectMode()).toBe(false);
});

test("clicking an Entity while select mode is on selects it and leaves select mode", () => {
  const { inspector } = startWithSelectableBox();

  inspector.toggleSelectMode();
  expect(inspector.getSelectMode()).toBe(true);

  clickOn(BOX_POSITION.x, BOX_POSITION.y);

  // inspectEntity selects and then toggles select mode back off.
  expect(inspector.getSelectMode()).toBe(false);
});

test("clicking away from the Entity leaves select mode on", () => {
  const { inspector } = startWithSelectableBox();

  inspector.toggleSelectMode();

  clickOn(300, 300);

  expect(inspector.getSelectMode()).toBe(true);
});

test("an Entity with no Geometry is not selectable", () => {
  let entity!: Entity;

  const root = startGame(() => {
    entity = useChild(function NoGeometry() {
      useType(NoGeometry);
    });
  });

  root.getComponent(Inspector)!.hide();

  expect(entity.hasComponent(Mouse)).toBe(false);
});

test("selecting works for whichever Entity was clicked", () => {
  let near!: Entity;
  let far!: Entity;

  const root = startGame(() => {
    near = useChild(function Near() {
      useType(Near);
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );
    });
    far = useChild(function Far() {
      useType(Far);
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(300, 100),
        })
      );
    });
  });

  const inspector = root.getComponent(Inspector)!;
  inspector.hide();

  expect(near.hasComponent(Mouse)).toBe(true);
  expect(far.hasComponent(Mouse)).toBe(true);

  inspector.toggleSelectMode();
  clickOn(300, 100);
  expect(inspector.getSelectMode()).toBe(false);
});
