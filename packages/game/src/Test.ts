import { useType, useNewComponent, useChild, useDestroy } from "@hex-engine/2d";

export default function Test() {
  useType(Test);

  useDestroy().onDestroy(() => {
    console.log("Test onDestroy");
  });

  useNewComponent(() => {
    useDestroy().onDestroy(() => {
      console.log("Test sub-component onDestroy");
    });
  });

  useChild(() => {
    useDestroy().onDestroy(() => {
      console.log("child onDestroy");
    });

    useNewComponent(() => {
      useDestroy().onDestroy(() => {
        console.log("child sub-component onDestroy");
      });
    });

    useChild(() => {
      useDestroy().onDestroy(() => {
        console.log("grandchild onDestroy");
      });

      useNewComponent(() => {
        useDestroy().onDestroy(() => {
          console.log("grandchild sub-component onDestroy");
        });
      });
    });
  });
}
