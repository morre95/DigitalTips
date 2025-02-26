import React, { useState, useEffect } from 'react';

import {View, Modal, Text, TextInput, StyleSheet, Button} from 'react-native'
import {Picker} from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

import { getDistance } from 'geolib';

interface iProps {
    isVisible: boolean;
    onFinnish: (numberOfCheckpoints: number, isRandomQuestions: boolean) => void;
}

const range = (start: number, end: number): number[] => {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
};

const RandomCheckPoints: React.FC<iProps> = ({ isVisible, onFinnish }) => {
    const [numberOfCheckpoints, setNumberOfCheckpoints] = useState(3);
    const [isChecked, setChecked] = useState(true);

    useEffect(() => {

    }, [isVisible]);

    return (
        <Modal
            visible={isVisible}
            animationType={"slide"}
            transparent={true}
        >
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <View style={styles.section}>
                        <Text style={[styles.paragraph, {color: 'red'}]}>Not implemented yet!!!</Text>
                    </View>
                    <View style={styles.section}>
                        <Checkbox
                            style={styles.checkbox}
                            value={isChecked}
                            onValueChange={setChecked}
                            color={isChecked ? '#0000ff' : undefined}
                        />
                        <Text style={styles.paragraph}>Generate random questions</Text>
                    </View>
                    <View style={styles.section}>
                        <Picker
                            style={{width: 100, height: 50}}
                            selectedValue={numberOfCheckpoints}
                            onValueChange={(itemValue) =>
                                setNumberOfCheckpoints(itemValue)
                            }
                        >
                            {
                                range(1, 26).map((item, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={item.toString()}
                                        value={item}
                                    />
                                ))
                            }
                        </Picker>
                        <Text style={styles.paragraph}>Number of checkpoints</Text>
                    </View>
                    <Button
                        title={'Generate'}
                        onPress={() => onFinnish(numberOfCheckpoints, isChecked)}
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
    },
    input: {
        width: '100%',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paragraph: {
        fontSize: 15,
    },
    checkbox: {
        margin: 8,
    },
})

export default RandomCheckPoints;