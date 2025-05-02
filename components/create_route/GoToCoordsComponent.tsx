import React from 'react';
import {StyleSheet, View, TextInput, TouchableOpacity} from 'react-native';
import {getCoordinatesFromAddress} from "@/functions/request";
import EvilIcons from '@expo/vector-icons/EvilIcons';

type CoordsFound = {
    longitude: number;
    latitude: number;
}

interface IProps {
    onCoordsFound: (coordsFound: CoordsFound) => void;
}

const GoToCoordsComponent = ({onCoordsFound}: IProps) => {
    const [text, onChangeText] = React.useState('');

    const handleOnSubmit = async () => {
        if (text.length > 2) {
            const result = await getCoordinatesFromAddress(text);
            if (result) {
                onCoordsFound({longitude: result.longitude, latitude: result.latitude});
            }
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                onSubmitEditing={handleOnSubmit}
                placeholder={'Go to address'}
                value={text}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleOnSubmit}
            >
                <EvilIcons name="search" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        paddingRight: 30
    },
    button: {
        marginTop: 20,
        marginLeft: -38,
    },
    buttonText: {
        textAlign: 'center',
        padding: 20,
        color: 'white',
    },
});

export default GoToCoordsComponent;