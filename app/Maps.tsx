import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus, StyleSheet, View} from 'react-native';
import {MapsProvider} from "@/components/maps/MapsContext";
import MapsComponent from "@/components/maps/MapsComponent";
import {getPlayerName} from "@/functions/common";
import PlayerNameSelect from "@/components/PlayerNameSelect";
import updatePlayerName from "@/functions/updatePlayerName";
import {useToken} from "@/components/login/LoginContext";
import { Redirect } from 'expo-router';
import register from "@/functions/register";

let updatePlayerTries = 0;

export default function Maps() {
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [showSelectPlayerName, setShowSelectPlayerName] = useState<boolean>(false);
    const {isAppRegisteredAsync} = useToken();

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
            return <Redirect href="/sign-in-app" />;
        }
        const playerName = await getPlayerName();
        if (playerName === null) {
            setShowSelectPlayerName(true);
        }
    };

    const handlePlayerNameSelect = async (playerName: string) => {
        const error = await updatePlayerName(playerName);
        if (!error) {
            if (!await register()) {
                console.log('Could not register app')
            } else if (++updatePlayerTries < 5) {
                return await handlePlayerNameSelect(playerName);
            }
            console.log(`Could not set name: ${playerName}`);
        }
        setShowSelectPlayerName(false);
    }

    const handlePlayerNameCancel = async () => {
        await handlePlayerNameSelect('Player 1');
    }

    return (
        <View style={styles.container}>
            <MapsProvider>
                <MapsComponent />
            </MapsProvider>
            <PlayerNameSelect
                visible={showSelectPlayerName}
                onSelect={handlePlayerNameSelect}
                onCancel={handlePlayerNameCancel}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});