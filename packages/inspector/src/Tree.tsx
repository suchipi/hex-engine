import { Component } from "@hex-engine/core";
import React from "react";
import { StateKey, StateListKey } from "react-state-tree";
import Expandable from "./Expandable";
import Button from "./Button";
import EditableString from "./EditableString";
import EditableBoolean from "./EditableBoolean";
import { StorageForInspectorHover } from "./useInspectorHover";

function gatherPropertyNames(
  obj: Object,
  soFar: Set<string | symbol> = new Set()
): Array<string | symbol> {
  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    gatherPropertyNames(proto, soFar);
  }

  Object.getOwnPropertyNames(obj).forEach((name) => soFar.add(name));

  const results = [...soFar].filter((prop) => {
    return (
      prop !== "constructor" && !(typeof prop === "string" && prop.match(/^_/))
    );
  });
  return results;
}

let globalVariableId = 0;
export default function Tree({
  name,
  data,
  parent,
}: {
  name: string;
  data: any;
  parent: any;
}) {
  let className = "";
  let hasContent = false;
  let preview: React.ReactNode = "";
  let content: React.ReactNode = "";
  let onMouseEnter: undefined | (() => void);
  let onMouseLeave: undefined | (() => void);

  const setValue = (newValue: any) => {
    parent[name] = newValue;
  };

  const color = (clr: string, str: React.ReactNode) => (
    <span style={{ color: clr }}>{str}</span>
  );

  function entriesForArray(array: Array<any>) {
    return (
      <StateListKey value="children">
        {array.map((val, index) => (
          <Tree key={index} data={val} name={String(index)} parent={array} />
        ))}
      </StateListKey>
    );
  }

  function entriesForProperties(properties: Array<symbol | string>) {
    hasContent = properties.length > 0;

    const sortedProperties = [...properties].sort((a, b) => {
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
    });

    let propsToRender = sortedProperties;
    if (sortedProperties.length > 50) {
      propsToRender = sortedProperties.slice(0, 50);
    }

    return (
      <StateKey value="p">
        {propsToRender.map((prop, index) => {
          const val = data[prop];
          return (
            <StateKey
              key={typeof prop === "string" ? prop : index}
              value={prop.toString()}
            >
              <Tree name={prop.toString()} data={val} parent={data} />
            </StateKey>
          );
        })}
        {propsToRender !== sortedProperties ? (
          <div style={{ paddingLeft: 8, paddingTop: 2 }}>
            ...and {sortedProperties.length - propsToRender.length} more
            properties not shown.
          </div>
        ) : null}
      </StateKey>
    );
  }

  if (typeof data === "boolean") {
    preview = (
      <EditableBoolean
        color="rgb(28, 0, 207)"
        value={data}
        onChange={(newValue) => {
          setValue(newValue);
        }}
      />
    );
  } else if (typeof data === "bigint") {
    preview = color("rgb(28, 0, 207)", String(data) + "n");
  } else if (typeof data === "number") {
    preview = (
      <EditableString
        expanded={false}
        color="rgb(28, 0, 207)"
        value={String(data)}
        onChange={(newValue) => {
          setValue(Number(newValue) || 0);
        }}
      />
    );
    hasContent = true;
    content = (
      <EditableString
        expanded={true}
        color="rgb(28, 0, 207)"
        value={String(data)}
        onChange={(newValue) => {
          setValue(Number(newValue) || 0);
        }}
      />
    );
  } else if (typeof data === "string") {
    preview = (
      <span>
        "
        <EditableString
          expanded={false}
          color="rgb(196, 26, 22)"
          value={data}
          onChange={(newValue) => {
            setValue(newValue);
          }}
        />
        "
      </span>
    );
    hasContent = true;
    content = (
      <EditableString
        expanded={true}
        color="rgb(196, 26, 22)"
        value={data}
        onChange={(newValue) => {
          setValue(newValue);
        }}
      />
    );
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
        <Button
          onClick={() => {
            data.call(parent);
          }}
          title="Run function"
          style={{
            fontFamily: "initial",
            cursor: "pointer",
            paddingLeft: 4,
            filter: "hue-rotate(-75deg)",
          }}
        >
          {"▶️"}
        </Button>
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
  } else if (data instanceof HTMLImageElement) {
    className = "HTMLImageElement";
    hasContent = true;
    content = (
      <div>
        <img style={{ maxWidth: "100%" }} src={data.src} />
        {entriesForProperties(gatherPropertyNames(data))}
      </div>
    );
  } else if (typeof data === "object" && data != null) {
    if (data._kind === "entity") {
      className = data.name ? `Entity (${data.name})` : "Entity";
      content = entriesForProperties([
        "children",
        "components",
        "name",
        "enable",
        "disable",
        "id",
        "destroy",
      ]);

      const hoverables: Array<Component> = [];
      for (const component of data.components) {
        hoverables.push(component);
      }
      for (const descendant of data.descendants()) {
        for (const component of descendant.components) {
          hoverables.push(component);
        }
      }

      onMouseEnter = () => {
        hoverables.forEach((component) => {
          const storageForEntity = component.entity.getComponent(
            StorageForInspectorHover
          );
          if (!storageForEntity) return;
          const storageForComponent = storageForEntity.beginCallbacks.get(
            component
          );
          if (!storageForComponent) return;

          storageForComponent.forEach((callback: () => void) => callback());
        });
      };

      onMouseLeave = () => {
        hoverables.forEach((component) => {
          const storageForEntity = component.entity.getComponent(
            StorageForInspectorHover
          );
          if (!storageForEntity) return;
          const storageForComponent = storageForEntity.endCallbacks.get(
            component
          );
          if (!storageForComponent) return;

          storageForComponent.forEach((callback: () => void) => callback());
        });
      };
    } else if (data._kind === "component") {
      className = data.type?.name
        ? `Component (${data.type?.name})`
        : "Component";
      if (!data.isEnabled) {
        className += " - disabled";
      }
      content = entriesForProperties(gatherPropertyNames(data));

      onMouseEnter = () => {
        const storageForEntity = data.entity.getComponent(
          StorageForInspectorHover
        );
        if (!storageForEntity) return;
        const storageForComponent = storageForEntity.beginCallbacks.get(data);
        if (!storageForComponent) return;

        storageForComponent.forEach((callback: () => void) => callback());
      };

      onMouseLeave = () => {
        const storageForEntity = data.entity.getComponent(
          StorageForInspectorHover
        );
        if (!storageForEntity) return;
        const storageForComponent = storageForEntity.endCallbacks.get(data);
        if (!storageForComponent) return;

        storageForComponent.forEach((callback: () => void) => callback());
      };
    } else if (data._kind === "grid" && typeof data.defaultValue === "number") {
      className = `Grid (${data.size.x}, ${data.size.y})`;
      content = (
        <>
          {data.data.map((row: Array<number>, xIndex: number) => (
            <div key={xIndex}>
              {row.map((gridValue, yIndex) => (
                <EditableString
                  key={yIndex}
                  expanded={false}
                  color="rgb(28, 0, 207)"
                  value={String(gridValue)}
                  onChange={(newValue) => {
                    data.data[xIndex][yIndex] =
                      Number(newValue) || data.defaultValue;
                  }}
                />
              ))}
            </div>
          ))}
          {entriesForProperties(gatherPropertyNames(data))}
        </>
      );
    } else if (data._kind === "grid" && typeof data.defaultValue === "string") {
      className = `Grid (${data.size.x}, ${data.size.y})`;
      content = (
        <>
          {data.data.map((row: Array<string>, xIndex: number) => (
            <div key={xIndex}>
              {row.map((gridValue, yIndex) => (
                <EditableString
                  expanded={false}
                  color="rgb(196, 26, 22)"
                  value={gridValue}
                  onChange={(newValue) => {
                    data.data[xIndex][yIndex] = newValue;
                  }}
                />
              ))}
            </div>
          ))}
          {entriesForProperties(gatherPropertyNames(data))}
        </>
      );
    } else if (data._kind === "grid") {
      className = `Grid (${data.size.x}, ${data.size.y})`;
      content = entriesForProperties(gatherPropertyNames(data));
    } else {
      const formatNumber = (val: any) => {
        const num = Number(val);
        const isInteger = num % 1 === 0;
        if (isInteger) return String(num);
        return num.toFixed(2);
      };

      className =
        (data.constructor?.name || "") +
        // Vector
        (data.x != null && data.y != null
          ? ` (${formatNumber(data.x)}, ${formatNumber(data.y)})`
          : "") +
        // LineSegment
        (typeof data.start === "object" &&
        data.start != null &&
        typeof data.end === "object" &&
        data.end != null &&
        data.start.x != null &&
        data.start.y != null &&
        data.end.x != null &&
        data.end.y != null
          ? ` (${formatNumber(data.start.x)}, ${formatNumber(
              data.start.y
            )}), (${formatNumber(data.end.x)}, ${formatNumber(data.end.y)})`
          : "") +
        // Polygon
        (Array.isArray(data.points) &&
        data.points.every(
          (point: any) =>
            typeof point === "object" &&
            point != null &&
            point.x != null &&
            point.x != null
        )
          ? ` [${data.points.map(
              (point: any) =>
                `(${formatNumber(point.x)}, ${formatNumber(point.y)})`
            )}]`
          : "");
      content = entriesForProperties(gatherPropertyNames(data));
    }
  }

  return (
    <Expandable
      className={className}
      label={name}
      hasContent={hasContent}
      preview={preview}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={(event) => {
        event.preventDefault();

        const variableName = "temp" + globalVariableId++;
        // @ts-ignore
        window[variableName] = data;
        console.log(variableName, data);

        alert(`Target stored as ${variableName}`);
      }}
    >
      {content}
    </Expandable>
  );
}
