import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import * as Location from 'expo-location';


import { Marker } from 'react-native-maps';
import { MarkerImages } from "@/hooks/images";

interface Checkpoint {
    checkpoint_id:    number;
    route_id:         number;
    latitude:         string;
    longitude:        string;
    question_id:      number;
    checkpoint_order: number;
    created_at:       Date;
    updated_at:       Date;
    question:         Question;
}

interface Question {
    text:    string;
    answers: Answer[];
}

interface Answer {
    text:      string;
    isCorrect: boolean;
}

interface ICheckPoint {
    checkpoint: Checkpoint;
    onQuestion: (question: Question) => void;
}

// Typdefinition för en koordinat
interface Coordinate {
    latitude: number;
    longitude: number;
}

// Haversine-formeln för att beräkna avståndet (i meter) mellan två koordinater
const haversineDistance = (coord1: Coordinate, coord2: Coordinate): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Jordens radie i meter

    const φ1 = toRad(coord1.latitude);
    const φ2 = toRad(coord2.latitude);
    const Δφ = toRad(coord2.latitude - coord1.latitude);
    const Δλ = toRad(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Avståndet i meter
};

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
    const distance = haversineDistance(userCoordinate, targetCoordinate);
    const threshold = 20; // Tröskelvärde i meter

    if (distance < threshold) {
        console.log('Användaren är nära den angivna koordinaten!');
        return true
    } else {
        console.log(`Avståndet är ${distance.toFixed(2)} meter, vilket är längre än ${threshold} meter.`);
        return false;
    }
};

let foregroundSubscription: Location.LocationSubscription | null = null

const CheckPoint: React.FC<ICheckPoint> = ({checkpoint, onQuestion}) => {

    const [location, setLocation] = useState<Coordinate | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);

    useEffect(() => {
        (async () => {
            const result = await checkProximity(location as Coordinate);
            if (result) {
                onQuestion(checkpoint.question)
            }
        })()
    }, [location]);

    // Request permissions right after starting the app
    useEffect(() => {
        (async () => {
            const foreground = await Location.requestForegroundPermissionsAsync()
            //if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
        })()
    }, [])

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
                setCurrentLocation({latitude: location.coords.latitude, longitude: location.coords.longitude})
            }
        )
    }

    // Stop location tracking in foreground
    const stopForegroundUpdate = () => {
        foregroundSubscription?.remove()
        setCurrentLocation(null)
    }

    // TBD: för mer om backgound uppdateringar https://chafikgharbi.com/expo-location-tracking/


    return (
        <Marker
            key={checkpoint.checkpoint_id}
            coordinate={{ latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude)  }}
            title={`Checkpoint: ${checkpoint.checkpoint_order}`}
            image={{uri: MarkerImages}}
            onPress={() => {
                console.log(`CheckPointOrder: ${checkpoint.checkpoint_order}`, {
                    latitude: Number(checkpoint.latitude),
                    longitude: Number(checkpoint.longitude)
                })
                setLocation({
                    latitude: Number(checkpoint.latitude),
                    longitude: Number(checkpoint.longitude)
                })
            }}
        />
    )
}

export default CheckPoint
