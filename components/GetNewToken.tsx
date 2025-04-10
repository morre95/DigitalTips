import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useToken} from "@/components/login/LoginContext";

const GetNewToken = () => {
    const {token, signInApp, signOutApp} = useToken();

    const handelNewToken = () => {
        signOutApp();
        signInApp();
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handelNewToken}>
                <Text style={styles.text}>Renew Token</Text>
            </TouchableOpacity>
            <Text style={styles.tokenText}>Token: {token?.slice(-15)}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 50,
    },
    button: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
    },
    text: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
    tokenText: {
        fontSize: 12,
    },
})

export default GetNewToken;