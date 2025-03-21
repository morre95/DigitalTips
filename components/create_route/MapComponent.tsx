import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import React, {useRef, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View, Alert} from "react-native";
import {MarkerData, RouteData, AnswerData} from "@/interfaces/common";
import { getCity } from "@/functions/request";
import { useCreateDispatch } from "@/components/create_route/CreateContext";
import CircleMarker from "@/components/create_route/CircleMarker";
import AddQuestion from "@/components/create_route/AddQuestion";
import {ButtonsComponent} from "@/components/create_route/ButtonsComponent";
import NextRoutesOverlay from "@/components/create_route/NextRoutesOverlay";
import AddQuestionFromDb from "@/components/create_route/AddQuestionFromDb";
import HamburgerMenu from "@/components/create_route/HamburgerMenu";
import RandomCheckPoints from "@/components/create_route/RandomCheckpoints";
import HelpPopup from "@/components/create_route/HelpPopup";

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
    const markerRef = useRef<RouteData | null>(null);
    const [showAddQuestion, setShowAddQuestion] = useState<boolean>(false);
    const [showNext, setShowNext] = useState<boolean>(false)
    const [showDbQuestionSelect, setShowDbQuestionSelect] = useState<boolean>(false)
    const [showHamburgerMenu, setShowHamburgerMenu] = useState<boolean>(false)
    const [showGenerateRandomCheckpoints, setShowGenerateRandomCheckpoints] = useState<boolean>(false)
    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
    const [showHelpPopup, setShowHelpPopup] = useState<boolean>(false)

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
        route.marker.city = city ?? 'Unknown'

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

    const handleNextCancel = () => {
        Alert.alert(
            'Delete checkpoints',
            'Du you really want to delete all checkpoints?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('handleDeleteAllMarkers()', 'Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes', onPress: () => {
                        handleDeleteAll()
                    }
                },
            ]);
    }

    const handelAddQuestionFromDB = (question: any) => {
        setShowDbQuestionSelect(false)
        setShowAddQuestion(true)

        let answers: AnswerData[] = []
        let newAnswers: AnswerData = {
            id: answers.length + 1,
            text: question.correct_answer,
            isRight: true,
        }
        answers.push(newAnswers)
        for (let incorrect of question.incorrect_answers) {
            newAnswers = {
                id: answers.length + 1,
                text: incorrect,
                isRight: false,
            }
            answers.push(newAnswers)
        }

        const order = markerRef?.current?.marker.markerOrder || 0

        handleSaveQuestion(question.question, answers, order)
    }

    const toggleHamburgerMenu = () => {
        setShowHamburgerMenu(!showHamburgerMenu);
    }

    const generateRandomCheckpoints = () => {
        setShowGenerateRandomCheckpoints(true)
    }

    const handleRandomFinished = (checkpoints: RouteData[]) => {
        setShowGenerateRandomCheckpoints(false)

        if (checkpoints.length <= 0) {
            return
        }

        const startOrder = state.checkpoints.length

        for (let i = 0; i < checkpoints.length; i++) {
            let checkpoint = checkpoints[i];
            if (startOrder > 0) {
                checkpoint.marker.id += startOrder
                checkpoint.marker.markerOrder += startOrder
            }
            dispatch({type: 'add', checkpoint: checkpoint })
        }
    }

    const handleHelp = () => {
        setShowHelpPopup(true)
    }

    return (
        <View style={styles.map}>
            {state.checkpoints.length > 0 ? <ButtonsComponent.CancelAndContinueButtons
                onContinue={handleContinue}
                onCancel={handleNextCancel}
            />: null}
            <MapView
                provider={PROVIDER_GOOGLE}
                region={initialRegion}
                style={styles.map}
                onPress={handleMapPress}
                onRegionChange={setCurrentRegion}
                showsMyLocationButton={false}
                toolbarEnabled={false}
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
                onAddQuestionFromDb={() => {
                    setShowDbQuestionSelect(true)
                    setShowAddQuestion(false)
                }}
            />

            {showNext &&
                <NextRoutesOverlay
                    currentRoutes={state.checkpoints}
                    onFinish={handleDeleteAll}
                    onClose={() => {
                        setShowNext(false)
                    }}
                />
            }

            {showDbQuestionSelect &&
                <AddQuestionFromDb
                    onSelectedQuestion={handelAddQuestionFromDB}
                />
            }

            <HelpPopup
                visible={showHelpPopup}
                onClose={() => setShowHelpPopup(false)}
            />

            <RandomCheckPoints
                isVisible={showGenerateRandomCheckpoints}
                onFinish={handleRandomFinished}
                currentCoordinate={{ latitude: currentRegion.latitude, longitude: currentRegion.longitude }}
            />

            <TouchableOpacity style={styles.hamburgerButton} onPress={toggleHamburgerMenu}>
                <Text style={styles.hamburgerButtonText}>≡</Text>
            </TouchableOpacity>
            <HamburgerMenu
                visible={showHamburgerMenu}
                onClose={toggleHamburgerMenu}
                onHelp={handleHelp}
                onGenerateRandomCheckpoints={generateRandomCheckpoints}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    hamburgerButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 30,
        elevation: 5, // för att ge en liten skugga (Android)
        shadowColor: '#000', // för iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    hamburgerButtonText: {
        fontSize: 24,
        textAlign: 'center',
    },
})