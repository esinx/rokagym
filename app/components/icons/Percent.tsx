import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const PercentIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      d="M16.243 6.343a1 1 0 1 1 1.414 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9ZM9.879 9.879A2 2 0 1 1 7.05 7.05 2 2 0 0 1 9.88 9.88ZM14.121 16.95a2 2 0 1 0 2.829-2.829 2 2 0 0 0-2.829 2.829Z"
      fill="currentColor"
    />
  </Svg>
);

export default PercentIcon;
