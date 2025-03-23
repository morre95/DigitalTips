import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus, StyleSheet, View, Text} from 'react-native';
import {MapsProvider} from "@/components/maps/MapsContext";
import MapsComponent from "@/components/maps/MapsComponent";
import registerOrLogin from "@/hooks/registerOrLogin";
import {getPlayerName} from "@/functions/common";
import PlayerNameSelect from "@/components/PlayerNameSelect";
import updatePlayerName from "@/functions/updatePlayerName";

export default function Maps() {
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [showSelectPlayerName, setShowSelectPlayerName] = useState<boolean>(false);

    useEffect(() => {
        startFunction();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [appState]);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            startFunction();
        }
        setAppState(nextAppState);
    };

    const startFunction = () => {
        (async () => {
            await registerOrLogin();

            const playerName = await getPlayerName();
            if (playerName === null) {
                setShowSelectPlayerName(true);
            }
        })();
    };

    const handlePlayerNameSelect = async (playerName: string) => {
        const error = await updatePlayerName(playerName);
        if (!error) {
            console.error('player name was not changed');
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