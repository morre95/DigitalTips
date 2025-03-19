import React from 'react';
import Svg, { Circle, Text } from 'react-native-svg';

interface CircleMarkerProps {
    order: number;
}

const CircleMarker: React.FC<CircleMarkerProps> = ({ order }) => {
    return (
        <Svg height="50" width="50">
            <Circle cx="20" cy="20" r="10" stroke="blue" strokeWidth="2.5" fill="lightblue" />
            <Text
                x="20"
                y="21"
                fontSize="14"
                fill="black"
                textAnchor="middle"
                alignmentBaseline="middle"
            >
                {order}
            </Text>
        </Svg>
    );
};


export default CircleMarker;