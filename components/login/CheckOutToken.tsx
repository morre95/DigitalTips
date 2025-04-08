import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

import {useToken} from '@/components/login/LoginContext'

const CheckOutToken = () => {
    const {token, isLoading, signInApp, signOutApp} = useToken();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!token) {
        return (
            <View>
                <Text>No token</Text>
                <TouchableOpacity style={styles.button} onPress={signInApp}>
                    <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text>Token: {token}</Text>
            <TouchableOpacity style={styles.button} onPress={signOutApp}>
                <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#2b52d1',
        padding: 10,
        margin: 20,
        borderRadius: 15
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
    },
});

export default CheckOutToken;