import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, View, Modal, Button, Pressable} from 'react-native';
import Checkbox from 'expo-checkbox';

interface City {
    city: string;
    selected: boolean;
}

interface Props {
    citys: string[]
    onChange: (citys: string[]) => void;
}

export default function CityComponent({ citys, onChange }: Props) {
    const [cityState, setCityState] = useState<City[]>([]);
    const [editCityState, setEditCityState] = useState<City[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const handleSave = () => {
        setCityState(editCityState)
        setModalVisible(false)
    }

    const handelCancel = () => {
        setEditCityState(cityState)
        setModalVisible(false)
    }

    const handlePressed = () => {
        setModalVisible(true)
    }

    const handleValueChange = (index: number) => {
        setEditCityState(prevCitys => prevCitys.map((city, i) => {
            if (i === index) {
                return {...city, selected: !prevCitys[i].selected}
            }
            return city;
        }))
    }

    useEffect(() => {
        const mappedCities = citys.filter(city => city.length > 0).map(city => ({
            city,
            selected: true,
        }));
        setCityState(mappedCities)
        setEditCityState(mappedCities)
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalWrapper}>
                        <Text>Selected Citys:</Text>
                        {editCityState.map((item: City, index: number) => (
                            <View key={index} style={styles.modalEdit}>
                                <Checkbox
                                    value={item.selected}
                                    onValueChange={() => handleValueChange(index)}
                                />
                                <Text key={index} style={styles.item}>
                                    {item.city}
                                </Text>
                            </View>
                        ))}
                        <View style={styles.modalButtons}>
                            <Button title="Save" onPress={handleSave} />
                            <Button title="Cancel" onPress={handelCancel} />
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalWrapper: {
        padding: 12,
        width: '100%',
        backgroundColor: '#fff',
    },
    modalEdit: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});