import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
    title: string;
    children: React.ReactNode;
}

const CollapsibleView = ({ title, children }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <View>
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
            {isOpen && children}
        </View>
    );
};

export default CollapsibleView;