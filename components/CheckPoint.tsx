import React from 'react';

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
    checkpoint: Checkpoint
}

const CheckPoint: React.FC<ICheckPoint> = ({checkpoint}) => {

    return (
        <Marker
            key={checkpoint.checkpoint_id}
            coordinate={{ latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude)  }}
            title={`Checkpoint: ${checkpoint.checkpoint_order}`}
            image={{uri: MarkerImages}}
            onPress={() => console.log(`CheckPointOrder: ${checkpoint.checkpoint_order}`, {latitude: Number(checkpoint.latitude), longitude: Number(checkpoint.longitude)})}
        />
    )
}

export default CheckPoint
