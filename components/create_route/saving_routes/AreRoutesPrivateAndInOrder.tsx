import React, { useState, useEffect } from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Checkbox from "expo-checkbox";

interface IProps {
    inputChanged: (ticks: {isPrivate: boolean, isInOrder: boolean}) => void;
}

const AreRoutesPrivateAndInOrder = ({inputChanged}: IProps) => {
    const [isInOrderChecked, setInOrderChecked] = useState(true);
    const [isPrivateChecked, setPrivateChecked] = useState(false);

    useEffect(() => {
        inputChanged({isPrivate: isPrivateChecked, isInOrder: isInOrderChecked})
    }, [isInOrderChecked, isPrivateChecked]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Checkbox
                    style={styles.checkbox}
                    value={isInOrderChecked}
                    onValueChange={setInOrderChecked}
                    color={isInOrderChecked ? '#4630EB' : undefined}
                />
                <Text style={styles.paragraph}>The Checkpoints is answered in order</Text>
            </View>
            <View style={styles.row}>
                <Checkbox
                    style={styles.checkbox}
                    value={isPrivateChecked}
                    onValueChange={setPrivateChecked}
                    color={isPrivateChecked ? '#f89f50' : undefined}
                />
                <Text style={styles.paragraph}>This route is private</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paragraph: {
        fontSize: 15,
    },
    checkbox: {
        margin: 8,
    },
});

export default AreRoutesPrivateAndInOrder;