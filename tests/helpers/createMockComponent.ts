import React from "react";

export function createMockComponent(tagName: string, withChildren = false) {
  if (withChildren) {
    return function MockComponent(props: Record<string, unknown>) {
      return React.createElement(
        tagName,
        props,
        (props as { children?: React.ReactNode }).children,
      );
    };
  }
  return function MockComponent(props: Record<string, unknown>) {
    return React.createElement(tagName, props);
  };
}
