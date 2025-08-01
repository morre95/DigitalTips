import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus, StyleSheet, View} from 'react-native';
import { MapsProvider } from "@/components/maps/MapsContext";
import MapsComponent from "@/components/maps/MapsComponent";
import { getPlayerId, getPlayerName, sleep, migrateDbIfNeeded } from "@/functions/common";
import PlayerNameSelect from "@/components/PlayerNameSelect";
import updatePlayerName from "@/functions/updatePlayerName";
import { useToken } from "@/components/login/LoginContext";
import { Redirect } from 'expo-router';
import register from "@/functions/register";
import Loader from "@/components/Loader";
import { SQLiteProvider } from 'expo-sqlite';
import {LocationProvider} from "@/hooks/LocationProvider";

let updatePlayerTries = 0;

export default function Maps() {
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [showSelectPlayerName, setShowSelectPlayerName] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const {token, signInApp, isAppRegisteredAsync} = useToken();

    useEffect(() => {
        (async () => {
            await startFunction()
        })();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [appState]);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            await startFunction();
        }
        setAppState(nextAppState);
    };

    const startFunction = async () => {
        const isAppRegistered = await isAppRegisteredAsync();
        if (!isAppRegistered) {
            return <Redirect href="./sign-in-app" />;
        }
        const playerName = await getPlayerName();
        if (playerName === null) {
            setShowSelectPlayerName(true);
        }
    };

    const handlePlayerNameSelect = async (playerName: string) => {
        setShowSelectPlayerName(false);
        setLoading(true);

        if (!token) {
            await signInApp();
        }

        const error = await updatePlayerName(playerName, token as string);
        if (!error) {
            let userId = await getPlayerId();
            let regResult = false;
            if (userId === -1) {
                regResult = await register();
                if (!regResult) {
                    throw new Error('Could not register app');
                } else if (++updatePlayerTries < 5) {
                    await sleep(10);
                    return await handlePlayerNameSelect(playerName);
                }
            }
            throw new Error(`Could not set name: ${playerName}`);
        }
        setLoading(false);
    }

    const handlePlayerNameCancel = async () => {
        setShowSelectPlayerName(false);
    }

    return (
        <View style={styles.container}>
            <LocationProvider>
                <MapsProvider>
                    <SQLiteProvider databaseName={'localDataStore.db'} onInit={migrateDbIfNeeded}>
                        <MapsComponent />
                    </SQLiteProvider>
                </MapsProvider>
            </LocationProvider>
            <PlayerNameSelect
                visible={showSelectPlayerName}
                onSelect={handlePlayerNameSelect}
                onCancel={handlePlayerNameCancel}
            />
            <Loader loading={loading} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});