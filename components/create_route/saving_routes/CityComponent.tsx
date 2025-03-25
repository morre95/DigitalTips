import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';

import SelectCityPopup from "../SelectCityPopup";

import {City} from '@/interfaces/City'

interface Props {
    citys: string[]
    onChange: (citys: string[]) => void;
}

export default function CityComponent({ citys, onChange }: Props) {
    const [cityState, setCityState] = useState<City[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const handleSave = (citys: City[]) => {
        setCityState(citys)
        setModalVisible(false)
    }

    const handelCancel = () => {
        setModalVisible(false)
    }

    const handlePressed = () => {
        setModalVisible(true)
    }


    useEffect(() => {
        const mappedCities = citys.filter(city => city.length > 0).map(city => ({
            city,
            selected: true,
        }));
        setCityState(mappedCities)
    }, [])

    useEffect(() => {
        onChange(cityState.filter(city => city.selected).map(city => city.city))
    }, [cityState])

    return (
        <View style={styles.container}>
            <Pressable
                onPress={handlePressed}
                style={styles.items}
            >
                {cityState.filter(city => city.selected).map((item: City, index: number) => (
                    <Text key={index} style={styles.item}>
                        {item.city}
                    </Text>
                ))}
            </Pressable>
            <SelectCityPopup
                isVisible={modalVisible}
                citys={cityState}
                onOk={handleSave}
                onCancel={handelCancel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        padding: 5,
    },
    items: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#e8e8e8',
    },
    item: {
        margin: 5,
    },
});