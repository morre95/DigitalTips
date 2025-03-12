import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, Button } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
    citys: string[]
    onChange: (citys: string[]) => void;
}

export default function CityComponent({ citys, onChange }: Props) {
    const [cityState, setCityState] = useState<string[]>(citys);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editIndex, setEditIndex] = useState(-1);

    const handelDelete = (cityToEdit: string) => {
        setCityState(preCitys => preCitys.filter((city) => city !== cityToEdit));
    }

    const handelEdit = (index: number) => {
        setModalVisible(true);
        setInputValue(cityState[index]);
        setEditIndex(index)
    }

    const handleSave = () => {
        if (editIndex >= 0) {
            setCityState(preCitys => preCitys.map((oldValue, index) => {
                if (index === editIndex)
                    return inputValue
                else
                    return oldValue
            }));
        } else {
            setCityState([...cityState, inputValue])
        }

        setModalVisible(false);
        setInputValue('');
        setEditIndex(-1)
    };

    const handleAdd = () => {
        setEditIndex(-1)
        setModalVisible(true);
    }

    useEffect(() => {
        onChange(cityState)
    }, [cityState]);

    return (
        <View style={styles.container}>
            {cityState.map((item: string, index: number) => (
                <View key={index} style={styles.item}>
                    <Text>
                        {item}
                    </Text>
                    <AntDesign.Button
                        name="delete"
                        size={24}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={() => handelDelete(item)}
                    />
                    <AntDesign.Button
                        name="edit"
                        size={24}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={() => handelEdit(index)}
                    />
                </View>
            ))}
            <Button title="Add" onPress={handleAdd} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Change me"
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Save" onPress={handleSave} />
                            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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
    item: {
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        margin: 5,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalWrapper: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '80%',
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
});