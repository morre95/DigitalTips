import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {View, Text, StyleSheet, Button, Linking, TouchableOpacity} from 'react-native';
import {fetchCityName} from '@/components/ReverseGeocoding';
import PlayerNameSelect from "@/components/PlayerNameSelect";
import updatePlayerName from "@/functions/updatePlayerName";
import PingApi from "@/components/PingApi";
import GetNewToken from "@/components/GetNewToken";
import Loader from "@/components/Loader";


export default function Settings() {
    const router = useRouter();  // Get the router instance
    const [selectPlayerNameVisible, setSelectPlayerNameVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);


    const openURL = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    }

    const openAppSettings = async () => {
        await Linking.openSettings();
    }

    const goToCredits = () => {
        // Navigate programmatically to the "Credits" page
        router.replace('/Credits');
    };

    const openSelectPlayerName = () => {
        setSelectPlayerNameVisible(true)
    }
    const handlePlayerNameSelect = async (playerName: string) => {
        setSelectPlayerNameVisible(false);
        setLoading(true);
        const error = await updatePlayerName(playerName);
        if (!error) {
            console.error('player name was not changed')
        }
        setLoading(false);
    }
    const handlePlayerNameCancel = () => {
        setSelectPlayerNameVisible(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button onPress={() => {
                    goToCredits();
                }} title="Credits" color="#1abc9c"/>
            </View>
            <View style={styles.buttonContainer}>
                <Button onPress={async () => {
                    await openAppSettings();
                }} title="Manage Permissions" color="#1abc9c"/>
            </View>
            <View style={styles.buttonContainer}>
                <Button onPress={() => {
                    openURL("https://www.yahoo.com");
                }} title="Privacy Policy" color="#1abc9c"/>
            </View>
            <View style={styles.buttonContainer}>
                <Button onPress={() => {
                    openURL("https://www.google.com");
                }} title="Terms & Conditions" color="#1abc9c"/>
            </View>
            <View style={styles.buttonContainer}>
                <Button onPress={async () => {
                    let city = await fetchCityName("58.753001", "17.008733");
                    console.log(city);
                }} title="Nyköping" color="#1abc9c"/>
            </View>
            <View style={styles.buttonContainer}>
                <Button onPress={async () => {
                    let city = await fetchCityName("48.855321", "2.345764");
                    console.log(city);
                }} title="Paris" color="#1abc9c"/>
            </View>


            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.touchableButton} onPress={openSelectPlayerName}>
                    <Text style={styles.touchableText}>Select Player Name</Text>
                </TouchableOpacity>
            </View>

            <PingApi />

            <GetNewToken />

            <PlayerNameSelect
                visible={selectPlayerNameVisible}
                onSelect={handlePlayerNameSelect}
                onCancel={handlePlayerNameCancel}
            />
            <Loader loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        marginTop: 32,
    },
    buttonContainer: {
        width: 200,
        height: 50,
    },
    touchableButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
    },
    touchableText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
});
