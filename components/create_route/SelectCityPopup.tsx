import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import {Checkbox} from 'expo-checkbox';
import { PopupBase } from "@/components/popup/PopupBase";

import {City} from '@/interfaces/City'

interface PopupProps {
    isVisible: boolean;
    citys: City[];
    onOk: (citys: City[]) => void;
    onCancel: () => void;
}

export default function SelectCityPopup({isVisible, citys, onOk, onCancel}:PopupProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cityState, setCityState] = useState<City[]>([]);

    useEffect(() => {
        setIsModalVisible(isVisible)
    }, [isVisible]);

    useEffect(() => {
        setCityState(citys)
    }, [citys]);

    const handleValueChange = (index: number) => {
        setCityState(prevCitys => prevCitys.map((city, i) => {
            if (i === index) {
                return {...city, selected: !prevCitys[i].selected}
            }
            return city;
        }))
    }

    const handleOk = () => {
        onOk(cityState)
    };

    const handleCancel = () => {
        setCityState(citys)
        onCancel()
    }

    return (
        <PopupBase isVisible={isModalVisible}>
            <PopupBase.Container>
                <View style={[styles.popup]}>
                    <PopupBase.Header title={'Selected Citys:'} />
                    <PopupBase.Body>
                        {cityState.map((item: City, index: number) => (
                            <View key={index} style={styles.item}>
                                <Checkbox
                                    value={item.selected}
                                    onValueChange={() => handleValueChange(index)}
                                />
                                <Text key={index} style={styles.itemText}>
                                    {item.city}
                                </Text>
                            </View>
                        ))}
                    </PopupBase.Body>
                    <PopupBase.Footer>
                        <PopupBase.OkCancelButtons
                            onCancel={handleCancel}
                            onOk={handleOk}
                        />
                    </PopupBase.Footer>
                </View>
            </PopupBase.Container>
        </PopupBase>
    )
}

const styles = StyleSheet.create({
    popup: {
        backgroundColor: "#ffffff",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#000",
        borderStyle: "solid",
        width: '90%',
    },
    item: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    itemText: {
        margin: 5,
    },
});
