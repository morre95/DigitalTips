
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import React from "react";
import { StyleSheet } from "react-native";
import { MarkerData } from "@/interfaces/common";
import { getCity } from "@/functions/request";
import { useCreateDispatch } from "@/components/create_route/CreateContext";
import CircleMarker from "@/components/create_route/CircleMarker";

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

    const handleMapPress = async (event: any) => {
        const { coordinate } = event.nativeEvent;

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})

        const len = state.checkpoints.length
        const newMarker: MarkerData = {
            id: len + 1,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            title: `Marker ${len + 1}`,
            markerOrder: len + 1,
            city: city ?? ''
        };

        dispatch({type: 'add', checkpoint: { marker: newMarker }});
    }

    return (
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
                        onDragEnd={(event) => console.log(event, route.marker.id)}
                        onPress={() => console.log(route.marker)}
                    >
                        <CircleMarker number={route.marker.markerOrder}/>
                    </Marker>
                )
            )}
        </MapView>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
})