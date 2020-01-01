import React from "react";
import Expandable from "./Expandable";

const PROPERTY_NAMES = Symbol("PROPERTY_NAMES");

function gatherPropertyNames(
  obj: Object,
  soFar: Set<string | symbol> = new Set()
): Array<string | symbol> {
  // @ts-ignore
  if (obj[PROPERTY_NAMES]) {
    // @ts-ignore
    return obj[PROPERTY_NAMES];
  }

  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    gatherPropertyNames(proto, soFar);
  }

  Object.getOwnPropertyNames(obj).forEach((name) => soFar.add(name));

  const results = [...soFar].filter((prop) => {
    return prop !== "constructor" && prop !== PROPERTY_NAMES;
  });
  // @ts-ignore
  obj[PROPERTY_NAMES] = results;
  return results;
}

export default function Tree({ name, data }: { name?: string; data: any }) {
  let className = "";
  let hasContent = false;
  let preview: React.ReactNode = "";
  let content: React.ReactNode = "";

  const color = (clr: string, str: React.ReactNode) => (
    <span style={{ color: clr }}>{str}</span>
  );

  function entriesForArray(array: Array<any>) {
    return (
      <>
        {array.map((val, index) => (
          <Tree key={index} data={val} />
        ))}
      </>
    );
  }

  function entriesForProperties(properties: Array<symbol | string>) {
    hasContent = properties.length > 0;
    return (
      <>
        {[...properties]
          .sort((a, b) => {
            const propA = a.toString();
            const propB = b.toString();

            const valA = data[propA];
            const valB = data[propB];

            if (typeof valA === "function" && typeof valB !== "function") {
              return 1;
            }
            if (typeof valA !== "function" && typeof valB === "function") {
              return -1;
            }

            if (propA[0] === "_" && propB[0] !== "_") {
              return 1;
            }
            if (propA[0] !== "_" && propB[0] === "_") {
              return -1;
            }

            if (propA.toUpperCase() < propB.toUpperCase()) {
              return -1;
            }
            if (propA.toUpperCase() > propB.toUpperCase()) {
              return 1;
            }

            return 0;
          })
          .map((prop, index) => {
            const val = data[prop];
            return (
              <Tree
                key={typeof prop === "string" ? prop : index}
                name={prop.toString()}
                data={val}
              />
            );
          })}
      </>
    );
  }

  if (typeof data === "boolean") {
    preview = color("rgb(28, 0, 207)", String(data));
  } else if (typeof data === "bigint") {
    preview = color("rgb(28, 0, 207)", String(data) + "n");
  } else if (typeof data === "number") {
    preview = color("rgb(28, 0, 207)", String(data));
  } else if (typeof data === "string") {
    preview = <span>"{color("rgb(196, 26, 22)", data)}"</span>;
  } else if (typeof data === "symbol") {
    preview = <span>"{color("rgb(196, 26, 22)", data.toString())}"</span>;
  } else if (
    typeof data === "object" &&
    data != null &&
    data.constructor === RegExp
  ) {
    preview = color("rgb(196, 26, 22)", data.toString());
  } else if (typeof data === "undefined") {
    preview = color("rgb(128, 128, 128)", "undefined");
  } else if (data === null) {
    preview = color("rgb(128, 128, 128)", "null");
  } else if (typeof data === "function") {
    preview = (
      <span>
        {color("rgb(13, 34, 170)", "ƒ ")}
        {data.name || "<anonymous function>"}
      </span>
    );
    hasContent = true;
    content = data.toString();
  } else if (Array.isArray(data)) {
    className = `Array(${data.length})`;
    hasContent = data.length > 0;
    content = entriesForArray(data);
    preview = hasContent ? "[...]" : "[]";
  } else if (data instanceof Set) {
    className = `Set(${data.size})`;
    hasContent = data.size > 0;
    preview = hasContent ? "[...]" : "[]";
    content = entriesForArray([...data.values()]);
  } else if (data instanceof Map) {
    className = `Map(${data.size})`;
    hasContent = data.size > 0;
    preview = hasContent ? "{...}" : "{}";
    content = entriesForArray([...data.entries()]);
  } else if (typeof data === "object" && data != null) {
    if (data._kind === "entity") {
      className = data.name ? `Entity (${data.name})` : "Entity";
      content = entriesForProperties(["name", "components", "children"]);
    } else if (data._kind === "component") {
      className = data.type.name
        ? `Component (${data.type.name})`
        : "Component";
      content = entriesForProperties(gatherPropertyNames(data));
    } else {
      className = data.constructor?.name || "";
      content = entriesForProperties(gatherPropertyNames(data));
    }
  }

  return (
    <Expandable
      className={className}
      label={name}
      hasContent={hasContent}
      preview={preview}
    >
      {content}
    </Expandable>
  );
}
