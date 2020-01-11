import {
  renderRootComponent,
  useNewComponent,
  BMFont,
  useEntityName,
} from "@hex-engine/2d";
import Root from "./Components/Root";
import testFnt from "./test.fnt";

// @ts-ignore
window.testFnt = testFnt;

renderRootComponent(() => {
  useEntityName("Root");

  useNewComponent(Root);
  useNewComponent(() => BMFont(testFnt));
});
