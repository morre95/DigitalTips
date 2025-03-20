
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import React, {useRef, useState} from "react";
import {StyleSheet, View} from "react-native";
import {MarkerData, RouteData, AnswerData} from "@/interfaces/common";
import { getCity } from "@/functions/request";
import { useCreateDispatch } from "@/components/create_route/CreateContext";
import CircleMarker from "@/components/create_route/CircleMarker";
import AddQuestion from "@/components/create_route/AddQuestion";
import {ButtonsComponent} from "@/components/create_route/ButtonsComponent";
import NextRoutesOverlay from "@/components/create_route/NextRoutesOverlay";

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
    const markerRef = useRef<RouteData | null>(null);
    const [showNext, setShowNext] = useState<boolean>(false)

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
        addQuestion({ marker: newMarker })
    }

    const addQuestion = (marker: RouteData) => {
        setShowAddQuestion(true)
        markerRef.current = marker
    }

    const handelDrag = async (event: any, route: RouteData) => {
        const { coordinate } = event.nativeEvent;
        route.marker.latitude = coordinate.latitude;
        route.marker.longitude = coordinate.longitude;

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})
        route.marker.city = city ?? ''

        dispatch({type: 'moveCheckpoint', checkpoint: route});
    }

    const handleSaveQuestion = (question: string, answers: AnswerData[], order: number) => {
        setShowAddQuestion(false)
        const marker = markerRef.current
        if (marker) {
            dispatch({type: 'addQuestion', checkpoint: {
                marker: marker.marker,
                question: question,
                answers: answers
            }});

            marker.marker.markerOrder = order
            dispatch({type: 'changeOrder', checkpoint: {
                    marker: marker.marker
            }})
        }
        markerRef.current = null
    }

    const handelCancelAddQuestion = () => {
        setShowAddQuestion(false)
        const marker = markerRef.current
        if (marker && !marker.question) {
            dispatch({type: 'delete', checkpoint: marker})
        }
        markerRef.current = null
    }

    const handeDeleteCheckpoint = () => {
        setShowAddQuestion(false)
        const marker = markerRef.current
        if (marker) {
            dispatch({type: 'delete', checkpoint: marker})
        }
        markerRef.current = null
    }

    const handleContinue = () => {
        setShowNext(true)
    }

    const handleDeleteAll = () => {
        dispatch({type: 'deleteAll'})
    }

    return (
        <View style={styles.map}>
            <ButtonsComponent.CancelAndContinueButtons
                onContinue={handleContinue}
                onCancel={handleDeleteAll}
            />
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
                                addQuestion(route)
                            }}
                        >
                            <CircleMarker
                                order={route.marker.markerOrder}
                            />
                        </Marker>
                    )
                )}
            </MapView>
            <AddQuestion
                visible={showAddQuestion}
                onCancel={handelCancelAddQuestion}
                onSave={handleSaveQuestion}
                currentCheckpoint={markerRef.current}
                numberOfCheckpoints={state.checkpoints.length}
                onDelete={handeDeleteCheckpoint}
            />

            {showNext && <NextRoutesOverlay
                currentRoutes={state.checkpoints}
                onFinish={handleDeleteAll}
                onClose={() => {
                    setShowNext(false)
                }}
            />}
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
})