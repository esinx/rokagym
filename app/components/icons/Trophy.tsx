import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const TrophyIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 15.9a5.002 5.002 0 0 0 4-4.9V4H7v7a5.002 5.002 0 0 0 4 4.9V18H9v2h6v-2h-2v-2.1ZM9 6h6v5a3 3 0 1 1-6 0V6Z"
      fill="currentColor"
    />
    <Path d="M18 6h2v5h-2V6ZM6 6H4v5h2V6Z" fill="currentColor" />
  </Svg>
);

export default TrophyIcon;
