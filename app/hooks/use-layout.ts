import { useState } from "react";
import { LayoutChangeEvent } from "react-native";

export const useLayout = () => {
  const [layout, setLayout] = useState<
    LayoutChangeEvent["target"] | undefined
  >();
  return {
    layout,
    onLayout: (evt: LayoutChangeEvent) => setLayout(evt.target),
  };
};
