import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import {Checkbox} from 'expo-checkbox';
import { useRouter } from 'expo-router';


const RouteSearchSettings = () => {
    const router = useRouter();
    const [isOpenRoutesChecked, setOpenRoutesChecked] = useState(false);

    const handleMyRoutesPressed = () => {
        router.push('./search/MyRoutes');
    }

    const handleOnOpenValueChange = (value: boolean) => {
        console.log('Only open routes not implemented!!!', value)
        setOpenRoutesChecked(value);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleMyRoutesPressed}>
                <Text style={styles.linkText}>My routes</Text>
            </TouchableOpacity>
            <View style={styles.section}>
                <Checkbox
                    style={styles.checkbox}
                    value={isOpenRoutesChecked}
                    onValueChange={handleOnOpenValueChange}
                    color={isOpenRoutesChecked ? '#7f7fd3' : undefined}
                />
                <Text style={styles.paragraph}>Only Open routes</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-evenly',

    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkText: {
        fontSize: 20,
        fontWeight: "400",
        color: "#3c8aea",
    },
    paragraph: {
        fontSize: 15,
    },
    checkbox: {
        margin: 8,
    },
});

export default RouteSearchSettings;