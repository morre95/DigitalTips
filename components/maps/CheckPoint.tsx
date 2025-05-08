import React, { useState, useEffect } from 'react';
import {StyleSheet, Text} from 'react-native'
import {getDistanceFast, globalThreshold} from '@/functions/getDistance';
import { MarkerImageBlue, MarkerImagePink, MarkerImageGreen } from "@/assets/images";
import {Checkpoint, Question} from "@/interfaces/common";
import MarkerShaker from "@/components/maps/MarkerShaker";
import {useLocation} from "@/hooks/LocationProvider";
import {useSQLiteContext} from "expo-sqlite";


interface ICheckPoint {
    checkpoint: Checkpoint;
    onQuestion: () => void;
    activeCheckpoint: boolean;
    onEnter: () => void;
    onLeave: () => void;
    onChange: (distance: number) => void;
    showNextCheckpoint: boolean;
    inOrder: boolean;

    testLocation?: {
        latitude: number;
        longitude: number;
    };
}


const CheckPoint: React.FC<ICheckPoint> = (
    {
        checkpoint,
        onQuestion,
        activeCheckpoint,
        onChange,
        onLeave,
        onEnter,
        showNextCheckpoint,
        inOrder,
        testLocation
    }) => {

    const [inActiveRegion, setInActiveRegion] = useState<boolean>(false);
    const {userLocation} = useLocation();
    const db = useSQLiteContext();

    useEffect(() => {
        if (testLocation) {
            const distance = calculateDistance(testLocation);

            checkDistance(distance);
        }
    }, [testLocation]);

    useEffect(() => {
        if (userLocation) {
            const distance = calculateDistance(userLocation.coords);

            checkDistance(distance);
        }
    }, [userLocation]);

    const calculateDistance = (location: {
        latitude: number;
        longitude: number;
    }): number => {
        return getDistanceFast(location, {
            latitude: Number(checkpoint.latitude),
            longitude: Number(checkpoint.longitude)
        }) - globalThreshold;
    };

    const checkDistance = (distance: number) => {
        if (distance <= 0) {
            onChange(0);
        } else {
            onChange(distance);
        }

        if (checkpoint.closest && distance < globalThreshold && (activeCheckpoint || !inOrder) && !inActiveRegion) {
            if (!checkpoint.isAnswered) {
                onQuestion();
            }
            onEnter();
            setInActiveRegion(true);
        } else if (!checkpoint.closest && distance >= globalThreshold && inActiveRegion) {
            onLeave();
            setInActiveRegion(false);
        }
    }

    const handelOnPress = async () => {
        console.log(`CheckPointOrder: ${checkpoint.checkpoint_order}`,
            userLocation ? calculateDistance(userLocation.coords): 'unknown',
            'meters to this checkpoint');
    };

    const getMarkerImageUri = (): string => {
        if (checkpoint.isAnswered) {
            const result = db.getFirstSync<{correct: number}>(
                "SELECT answered_correctly AS correct FROM route_progress WHERE checkpoint_id = ?",
                [checkpoint.checkpoint_id]
            );
            if (result && result.correct === 1) {
                return MarkerImageGreen;
            }
            return MarkerImagePink;
        }
        return MarkerImageBlue;
    }

    return (
        <MarkerShaker
            key={checkpoint.checkpoint_id}
            coordinate={{ latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude)  }}
            title={`Checkpoint: ${inOrder ? checkpoint.checkpoint_order: '#'}`}
            image={showNextCheckpoint ? undefined : {
                uri: getMarkerImageUri()
            }}
            onPress={handelOnPress}
            triggerShake={showNextCheckpoint}
            direction={'vertical'}
        >
            {showNextCheckpoint ? <Text style={styles.markerText}>{inOrder ? checkpoint.checkpoint_order: '#'}</Text> : null}
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
