import React from 'react';
import { View, DimensionValue } from 'react-native';

interface IProps {
    horizontal?: boolean;
    size: DimensionValue;
}

const Spacer = ({horizontal, size}: IProps) => {
    const defaultValue = 'auto';

    return (
        <View
            style={{
                width: horizontal ? size : defaultValue,
                height: !horizontal ? size : defaultValue,
            }}
        />
    );
};


export default Spacer;