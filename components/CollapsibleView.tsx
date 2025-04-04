import React, { useState } from 'react';
import {View, ViewStyle, Text, TouchableOpacity, StyleProp} from 'react-native';

import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
    title: string;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const CollapsibleView = ({ title, children, style }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <View style={style}>
            <TouchableOpacity onPress={() => setIsOpen((value) => !value)}>
                <View style={{flexDirection: 'row'}}>
                    <AntDesign
                        name="right"
                        size={24}
                        color="black"
                        style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
                    />
                    <Text style={{marginLeft: 10}}>{title}</Text>
                </View>
            </TouchableOpacity>
            {isOpen &&
                <View>
                    {children}
                </View>}
        </View>
    );
};

export default CollapsibleView;