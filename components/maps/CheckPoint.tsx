import React, { useState, useEffect } from 'react';
import {StyleSheet, Text} from 'react-native'
import {getDistanceFast} from '@/functions/getDistance';
import { MarkerImages } from "@/assets/images";
import {Checkpoint, Question} from "@/interfaces/common";
import MarkerShaker from "@/components/maps/MarkerShaker";
import {useLocation} from "@/hooks/LocationProvider";


interface ICheckPoint {
    checkpoint: Checkpoint;
    onQuestion: (question: Question, checkpointId: number, isAnswered: boolean | undefined) => void;
    activeCheckpoint: boolean;
    onEnter: () => void;
    onLeave: () => void;
    onChange: (distance: number) => void;
    showNextCheckpoint: boolean;
    inOrder: boolean;
}

const globalThreshold = 20 /*9_000_000;*/ // Tröskelvärde i meter

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
    }) => {

    const [inActiveRegion, setInActiveRegion] = useState<boolean>(false);
    const {userLocation} = useLocation();

    useEffect(() => {
        if (userLocation) {
            const distance = getDistanceFast(userLocation.coords, {
                latitude: Number(checkpoint.latitude),
                longitude: Number(checkpoint.longitude)
            }) - globalThreshold;

            if (distance <= 0) {
                onChange(0);
            } else {
                onChange(distance);
            }

            if (distance < globalThreshold && (activeCheckpoint || !inOrder) && !inActiveRegion) {
                onQuestion(checkpoint.question, checkpoint.checkpoint_id, checkpoint.isAnswered)
                onEnter();
                setInActiveRegion(true);
            } else if (activeCheckpoint && inActiveRegion) {
                onLeave();
                setInActiveRegion(false);
            }
        }
    }, [userLocation]);

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
            title={`Checkpoint: ${inOrder ? checkpoint.checkpoint_order: '#'}`}
            image={showNextCheckpoint ? undefined : {uri: MarkerImages}}
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
