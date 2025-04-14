import React, { useState, useEffect } from 'react';
import {StyleSheet, Text} from 'react-native'
import { getDistance } from 'geolib';
import * as Location from 'expo-location';
import { MarkerImages } from "@/assets/images";
import {Checkpoint, Question} from "@/interfaces/common";
import MarkerShaker from "@/components/maps/MarkerShaker";


interface ICheckPoint {
    checkpoint: Checkpoint;
    onQuestion: (question: Question, id: number) => void;
    activeCheckpoint: boolean;
    onEnter: () => void;
    onLeave: () => void;
    onChange: (distance: number) => void;
    showNextCheckpoint: boolean;
    // TBD: currentPosition har bara laggts till för att användas i debug syfte
    currentPosition?: Coordinate;
}

// Typdefinition för en koordinat
interface Coordinate {
    latitude: number;
    longitude: number;
}

const globalThreshold = 20 /*9_000_000;*/ // Tröskelvärde i meter

let foregroundSubscription: Location.LocationSubscription | null = null

const CheckPoint: React.FC<ICheckPoint> = (
    {
        checkpoint,
        onQuestion,
        activeCheckpoint,
        onChange,
        onLeave,
        onEnter,
        currentPosition,
        showNextCheckpoint
    }) => {

    const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate | null>(null);
    const [inActiveRegion, setInActiveRegion] = useState<boolean>(false);

    useEffect(() => {
        if (currentPosition) {
            setCurrentCoordinate(currentPosition);
        }

        // TBD: ska tas bort när testning är klar och hur game play ska vara är bestämt
        if (currentPosition && activeCheckpoint) {
            const distance = getDistance(currentPosition, {
                latitude: Number(checkpoint.latitude),
                longitude: Number(checkpoint.longitude)
            }) - globalThreshold;

            if (distance <= 0) {
                if (onChange) {
                    onChange(0);
                }
            } else {
                if (onChange) {
                    onChange(distance);
                }
            }
        }

    }, [currentPosition]);

    useEffect(() => {
        if (activeCheckpoint && inActiveRegion) {
            onQuestion(checkpoint.question, checkpoint.checkpoint_id)
            if (onEnter) {
                onEnter();
            }
        } else if (onLeave && activeCheckpoint) {
            onLeave();
        }
    }, [inActiveRegion]);

    useEffect(() => {
        if (currentCoordinate) {
            const targetCoordinate = { latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude) }
            const distance = getDistance(currentCoordinate, targetCoordinate);

            if (distance < globalThreshold) {
                //console.log(`Avståndet är ${distance.toFixed(2)} meter, vilket är kortare än ${globalThreshold} meter.`);
                setInActiveRegion(true);
                stopForegroundUpdate();
            } else if (activeCheckpoint) {
                setInActiveRegion(false);
            }
        }
    }, [currentCoordinate]);

    // Request permissions right after starting the app
    useEffect(() => {
        (async () => {
            const foreground = await Location.requestForegroundPermissionsAsync()
            if (!foreground.granted) {
                console.error('Location request not granted');
            }
            //if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
            if (activeCheckpoint) {
                await startForegroundUpdate();
                //console.log('currentCheckpoint id: ', checkpoint.checkpoint_id, 'startForegroundUpdate()')
            }
        })()
    }, [activeCheckpoint])

    // Start location tracking in foreground
    const startForegroundUpdate = async () => {
        // Check if foreground permission is granted
        const { granted } = await Location.getForegroundPermissionsAsync();
        if (!granted) {
            //console.log("location tracking denied")
            return
        }

        // Make sure that foreground location tracking is not running
        foregroundSubscription?.remove()

        // Start watching position in real-time
        foregroundSubscription = await Location.watchPositionAsync(
            {
                // For better logs, we set the accuracy to the most sensitive option
                accuracy: Location.Accuracy.BestForNavigation,
            },
            location => {
                setCurrentCoordinate({latitude: location.coords.latitude, longitude: location.coords.longitude})
            }
        )
    }

    // Stop location tracking in foreground
    const stopForegroundUpdate = () => {
        foregroundSubscription?.remove();
        setCurrentCoordinate(null);
    }

    // TBD: för mer om backgound uppdateringar https://chafikgharbi.com/expo-location-tracking/

    const handelOnPress = async () => {
        console.log(`CheckPointOrder: ${checkpoint.checkpoint_order}`, {
            latitude: Number(checkpoint.latitude),
            longitude: Number(checkpoint.longitude)
        }, 'nothing implemented here yet')
    }


    return (
        <MarkerShaker
            key={checkpoint.checkpoint_id}
            coordinate={{ latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude)  }}
            title={`Checkpoint: ${checkpoint.checkpoint_order}`}
            image={showNextCheckpoint ? undefined : {uri: MarkerImages}}
            onPress={handelOnPress}
            triggerShake={showNextCheckpoint}
            direction={'vertical'}
        >
            {showNextCheckpoint ? <Text style={styles.markerText}>{checkpoint.checkpoint_order}</Text> : null}
        </MarkerShaker>
    )
}

const styles = StyleSheet.create({
    markerText: {
        fontWeight: 'bold',
        fontSize: 26,
        color: '#a65bb8',
    },
});

export default CheckPoint
