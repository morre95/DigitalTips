import React, {useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { router } from 'expo-router';
import {useToken} from '@/components/login/LoginContext'
import Loader from "@/components/Loader";

const CheckOutToken = () => {
    const {token, isLoading, signInApp, signOutApp} = useToken();

    if (isLoading) {
        return <Loader loading={true} />;
    }

    useEffect(() => {
        if (!token) {
            signInApp();
            router.replace('/Maps');
        }
    }, [token]);

    return (
        <View style={styles.container}>
            <Text>Token: {token}</Text>
            <TouchableOpacity style={styles.button} onPress={signOutApp}>
                <Text style={styles.buttonText}>Refresh token</Text>
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