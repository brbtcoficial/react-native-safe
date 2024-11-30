import React from 'react';
import { PixelRatio } from 'react-native';
import { Svg, Polyline, type SvgProps } from 'react-native-svg';

const PopIcon = (props: SvgProps): JSX.Element => {
  return (
    <Svg
      style={props.style}
      width={25}
      height={25}
      viewBox="120 0 512 512"
      stroke={'#B2B2B2'}
      fill="none"
      strokeLinecap="round"
      {...props}
      strokeWidth={PixelRatio.getPixelSizeForLayoutSize(
        Number(props.strokeWidth ?? 22)
      )}
    >
      <Polyline points="370.5,26.9 141.4,256 370.5,485.1 " />
    </Svg>
  );
};

export default PopIcon;
