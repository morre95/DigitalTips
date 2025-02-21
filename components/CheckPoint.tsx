import React, { useState, useEffect } from 'react';

import { getDistance } from 'geolib';

import * as Location from 'expo-location';

import { Marker } from 'react-native-maps';
import { MarkerImages } from "@/hooks/images";

import {Checkpoint, Question} from "@/interfaces/common";


interface ICheckPoint {
    checkpoint: Checkpoint;
    onQuestion: (question: Question, id: number) => void;
    activeCheckpoint: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
    onPress?: (message: string) => void;
    currentPosition?: Coordinate;
}

// Typdefinition för en koordinat
interface Coordinate {
    latitude: number;
    longitude: number;
}

const globalThreshold = 20 /*9_000_000;*/ // Tröskelvärde i meter

const checkProximity = async (targetCoordinate: Coordinate): Promise<boolean> => {
    // Be om platsbehörighet
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        console.error('Platsbehörighet nekad');
        return false;
    }

    // Hämta användarens nuvarande position
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const userCoordinate: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };

    // Beräkna avståndet mellan användaren och målkoordinaten
    const distance = getDistance(userCoordinate, targetCoordinate);

    if (distance < globalThreshold) {
        console.log('Användaren är nära den angivna koordinaten!');
        return true
    } else {
        console.log(`Avståndet är ${distance.toFixed(2)} meter, vilket är längre än ${globalThreshold} meter.`);
        return false;
    }
};

let foregroundSubscription: Location.LocationSubscription | null = null

const CheckPoint: React.FC<ICheckPoint> = (
    {
        checkpoint,
        onQuestion,
        activeCheckpoint,
        onPress,
        onLeave,
        onEnter,
        currentPosition
    }) => {

    const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate | null>(null);
    const [inActiveRegion, setInActiveRegion] = useState<boolean>(false);

    useEffect(() => {
        if (currentPosition) setCurrentCoordinate(currentPosition)

        console.log('currentPosition changed in Checkpoint component', currentPosition)

    }, [currentPosition]);

    useEffect(() => {
        if (activeCheckpoint && inActiveRegion) {
            onQuestion(checkpoint.question, checkpoint.checkpoint_id)
            if (onEnter) {
                onEnter()
            }
        } else if (onLeave && activeCheckpoint) {
            onLeave()
        }
    }, [inActiveRegion]);

    useEffect(() => {
        if (currentCoordinate) {
            const targetCoordinate = { latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude) }
            const distance = getDistance(currentCoordinate, targetCoordinate);

            if (distance < globalThreshold) {
                console.log(`Avståndet är ${distance.toFixed(2)} meter, vilket är kortare än ${globalThreshold} meter.`);
                setInActiveRegion(true)
                stopForegroundUpdate()
            } else if (activeCheckpoint) {
                setInActiveRegion(false)
            }
        }
    }, [currentCoordinate]);

    // Request permissions right after starting the app
    useEffect(() => {
        (async () => {
            const foreground = await Location.requestForegroundPermissionsAsync()
            if (foreground.granted) {
                console.log('Location requests is granted');
            } else {
                console.error('Location request not granted');
            }
            //if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
            if (activeCheckpoint) {
                await startForegroundUpdate()
                console.log('currentCheckpoint id: ', checkpoint.checkpoint_id, 'startForegroundUpdate()')
            }
            console.log('currentCheckpoint id: ', checkpoint.checkpoint_id, 'Is monitored:', activeCheckpoint)
        })()
    }, [activeCheckpoint])

    // Start location tracking in foreground
    const startForegroundUpdate = async () => {
        // Check if foreground permission is granted
        const { granted } = await Location.getForegroundPermissionsAsync()
        if (!granted) {
            console.log("location tracking denied")
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
        foregroundSubscription?.remove()
        setCurrentCoordinate(null)
    }

    // TBD: för mer om backgound uppdateringar https://chafikgharbi.com/expo-location-tracking/

    const handelOnPress = async () => {
        console.log(`CheckPointOrder: ${checkpoint.checkpoint_order}`, {
            latitude: Number(checkpoint.latitude),
            longitude: Number(checkpoint.longitude)
        })

        const result = await checkProximity({
            latitude: Number(checkpoint.latitude),
            longitude: Number(checkpoint.longitude)
        });
        if (result) {
            if (onPress) onPress('You are close enough to get a question')
        } else if (onPress) {
            onPress('Not so close')
        }
    }


    return (
        <Marker
            key={checkpoint.checkpoint_id}
            coordinate={{ latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude)  }}
            title={`Checkpoint: ${checkpoint.checkpoint_order}`}
            image={{uri: MarkerImages}}
            onPress={handelOnPress}
        />
    )
}

export default CheckPoint
