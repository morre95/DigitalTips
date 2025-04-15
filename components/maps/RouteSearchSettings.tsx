import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React from "react";

interface Props {

}

const RouteSearchSettings = ({}: Props) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => console.log('Show my routes not implemented!!!')}>
                <Text style={styles.linkText}>My routes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Show my only open routes not implemented!!!')}>
                <Text style={styles.linkText}>Only Open routes</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-evenly',

    },
    linkText: {
        fontSize: 20,
        fontWeight: "400",
        color: "#3c8aea",
    }
});

export default RouteSearchSettings;