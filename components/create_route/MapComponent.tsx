
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import React, {useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {MarkerData, RouteData, Question} from "@/interfaces/common";
import { getCity } from "@/functions/request";
import { useCreateDispatch } from "@/components/create_route/CreateContext";
import CircleMarker from "@/components/create_route/CircleMarker";
import AddQuestion from "@/components/create_route/AddQuestion";

type Region = {
    latitude: number
    latitudeDelta: number
    longitude: number
    longitudeDelta: number
}

const initialRegion: Region = {
    latitude: 58.317435384,
    longitude: 15.123921353,
    latitudeDelta: 0.0622,
    longitudeDelta: 0.0700,
};

export function MapComponent() {
    const {state, dispatch} = useCreateDispatch();
    const [showAddQuestion, setShowAddQuestion] = useState<boolean>(false);

    const handleMapPress = async (event: any) => {
        const { coordinate } = event.nativeEvent

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})

        const len = state.checkpoints.length
        const newMarker: MarkerData = {
            id: len + 1,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            title: `Marker ${len + 1}`,
            markerOrder: len + 1,
            city: city ?? ''
        }

        dispatch({type: 'add', checkpoint: { marker: newMarker }})
        addQuestion(newMarker)
    }

    const addQuestion = (marker: MarkerData) => {
        setShowAddQuestion(true)
    }

    const handelDrag = async (event: any, route: RouteData) => {
        const { coordinate } = event.nativeEvent;
        route.marker.latitude = coordinate.latitude;
        route.marker.longitude = coordinate.longitude;

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})
        route.marker.city = city ?? ''

        dispatch({type: 'move_checkpoint', checkpoint: route});
    }

    const handleSaveQuestion = (question: Question) => {
        setShowAddQuestion(false)

    }

    return (
        <View style={styles.map}>
            <MapView
                provider={PROVIDER_GOOGLE}
                region={initialRegion}
                style={styles.map}
                onPress={handleMapPress}
            >
                {state.checkpoints.map(
                    (route, index) => (
                        <Marker
                            key={index}
                            coordinate={{latitude: route.marker.latitude, longitude: route.marker.longitude}}
                            draggable
                            onDragEnd={(event) => handelDrag(event, route)}
                            onPress={() => {
                                addQuestion(route.marker)
                            }}
                        >
                            <CircleMarker number={route.marker.markerOrder}/>
                        </Marker>
                    )
                )}
            </MapView>
            <AddQuestion
                visible={showAddQuestion}
                onCancel={() => setShowAddQuestion(false)}
                onSave={handleSaveQuestion}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
})