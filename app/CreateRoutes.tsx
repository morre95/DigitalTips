import AddQuestionFromDb from '@/components/AddQuestionFromDb';
import CircleMarker from "@/components/create_route/CircleMarker";
import { ButtonsComponent } from '@/components/create_route/ButtonsComponent';
import NextRoutesOverlay from '@/components/NextRoutesOverlay';
import RandomCheckPoints from "@/components/RandomCheckpoints";
import registerOrLogin, { globals } from "@/hooks/registerOrLogin";
import { AnswerData, MarkerData, RouteData } from '@/interfaces/common';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getCity } from '@/functions/request'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));



type Region = {
    latitude: number
    latitudeDelta: number
    longitude: number
    longitudeDelta: number
}

function updateMarkerOrderForRoutes(
    routes: RouteData[],
    targetId: number,
    newOrder: number
): RouteData[] {
    // Skapa en kopia av arrayen och sortera utifrån marker.markerOrder
    const sortedRoutes = [...routes].sort((a, b) => a.marker.markerOrder - b.marker.markerOrder);

    // Hitta index för den RouteData som innehåller marker med targetId
    const currentIndex = sortedRoutes.findIndex(route => route.marker.id === targetId);
    if (currentIndex === -1) {
        throw new Error(`Marker med id ${targetId} hittades inte.`);
    }

    // Ta bort objektet som ska flyttas
    const [targetRoute] = sortedRoutes.splice(currentIndex, 1);

    // Beräkna nytt index utifrån newOrder (notera att newOrder börjar på 1)
    const newIndex = Math.max(0, Math.min(newOrder - 1, sortedRoutes.length));

    // Infoga targetRoute på den nya positionen
    sortedRoutes.splice(newIndex, 0, targetRoute);

    // Uppdatera markerOrder för varje RouteData så att de blir sekventiella
    sortedRoutes.forEach((route, index) => {
        route.marker.markerOrder = index + 1;
    });

    return sortedRoutes;
}



export default function CreateRoutes() {
    const [markerToSave, setMarkerToSave] = useState<MarkerData>();
    const [questionText, setQuestionText] = useState('');
    const [currentAnswers, setCurrentAnswers] = useState<AnswerData[]>([]);
    const [showAddQuestions, setShowAddQuestions] = useState(false);

    const [currentRoutes, setCurrentRoutes] = useState<RouteData[]>([]);

    const initialRegion: Region = {
        latitude: 58.317435384,
        longitude: 15.123921353,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0700,
    };

    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

    // TODO: ta bort denna state och använd showAddQuestions istället
    const [editMode, setEditMode] = useState(false);

    const [JWT_token, setJWT_token] = useState<string>();

    const [showDbQuestionSelect, setShowDbQuestionSelect] = useState<boolean>(false)
    const [returnRandomQuestion, setReturnRandomQuestion] = useState<boolean>(false);

    const [generateRandomCheckpointsVisible, setGenerateRandomCheckpointsVisible] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            await registerOrLogin();

            if (globals.JWT_token) {
                console.log('JWT token:', globals.JWT_token);
                setJWT_token(globals.JWT_token)
            } else {
                console.log('inte inloggad');
            }
        })();
    }, [])

    const handleMapPress = async (event: any) => {
        if (editMode) {
            cancelAddQuestions()
            return
        }

        activateNextButton()

        const { coordinate } = event.nativeEvent;

        const city = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})

        const len = currentRoutes.length
        const newMarker: MarkerData = {
            id: len + 1,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            title: `Marker ${len + 1}`,
            markerOrder: len + 1,
            city: city ?? ''
        };

        setEditMode(true)
        Alert.alert(
            'Marker Added',
            'Add question or cancel',
            [
                {
                    text: `Add Random question`,
                    onPress: () => {
                        setShowAddQuestions(true)
                        setReturnRandomQuestion(true)
                        setShowDbQuestionSelect(true)
                        setMarkerToSave(newMarker);
                    },
                    style: 'default'
                },
                {
                    text: `Add question`,
                    onPress: () => { handleAddQuestionToMarker(newMarker, undefined, []) },
                    style: 'default'
                },
                {
                    text: 'Cancel',
                    onPress: () => {
                        console.log('handleMapPress()', 'Cancel Pressed')
                        setMarkerToSave(undefined)
                        setEditMode(false)
                        if (currentRoutes.length <= 0) {
                            deactivateNextButton()
                        }
                    },
                    style: 'cancel',
                },
            ], {
            cancelable: true,
            onDismiss: () => {
                console.log('handleMapPress()', 'onDismiss() activated')
            }
        })
    };

    const handleMarkerOnPress = (marker: MarkerData) => {
        if (editMode) {
            console.log('MarkerOnPress', 'editMode:', editMode);
            return
        }

        setEditMode(true)

        let savedMarker: MarkerData | null = null;
        let question: string | undefined;
        let answers: AnswerData[] | undefined;

        for (let [_, routerData] of Object.entries(currentRoutes)) {
            if (routerData.marker.id === marker.id) {
                savedMarker = routerData.marker
                question = routerData.question
                answers = routerData.answers
                break
            }
        }

        const deleteMarker = () => {
            setCurrentRoutes(prevRoutes => {
                const newRoutes = prevRoutes.filter(route => route.marker.id !== marker.id)
                if (newRoutes.length <= 0) {
                    deactivateNextButton()
                }
                return newRoutes
            }
            )

            setEditMode(false)
        }

        const addOrDelete = savedMarker ? "Edit" : "Add";

        Alert.alert(
            `${addOrDelete} marker`,
            `Do you want to ${addOrDelete.toLowerCase()} question or delete checkpoint ${marker.id}`,
            [
                {
                    text: `${addOrDelete} question`,
                    onPress: () => { handleAddQuestionToMarker(marker, question, answers || []) },
                },
                {
                    text: 'Cancel',
                    onPress: () => {
                        console.log('MarkerOnPress', 'Cancel Pressed')
                        setEditMode(false)
                    },
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        deleteMarker()
                    },
                    style: 'destructive'
                },
            ]);
    }

    const handleAddQuestionToMarker = (marker: MarkerData, question: string | undefined, answers: AnswerData[]) => {
        setMarkerToSave(marker);
        console.log(marker)
        setShowAddQuestions(true);
        if (question && answers.length > 0) {
            setQuestionText(question)
            setCurrentAnswers(answers)
        }
    }

    const handleDragEnd = (event: any, markerId: number) => {
        const { coordinate } = event.nativeEvent;

        setCurrentRoutes(prevRoutes =>
            prevRoutes.map(route =>
                route.marker.id === markerId ? {
                    ...route,
                    marker: {
                        ...route.marker,
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude
                    }
                } : route
            )
        );

    }

    const handleGoToMapsPress = () => {

        router.replace({
            pathname: "./Maps",
            params: {
                routerData: JSON.stringify(currentRegion)
            }
        })
    }

    const [showNext, setShowNext] = useState<boolean>(false)
    const handleSaveMarkers = async () => {
        //if (markers.length !== currentRoutes.length) {
        if (currentRoutes.find(route => route.question === undefined)) {
            // TODO: tala om vilken markerOrder som inte har en fråga
            Alert.alert(
                'Antalet markers som har frågor stämmer inte överens med antalet markers',
                'The rout contains checkpoints without question'
            );
        } else {
            setShowNext(true)
        }
    }

    const handleDeleteAllMarkers = () => {
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
                        setCurrentRoutes([])
                        deactivateNextButton()
                    }
                },
            ]);

    }

    const addAnswerField = () => {
        setCurrentAnswers([...currentAnswers, { id: Date.now(), text: '', isRight: false }]);
    };

    const removeAnswerField = (index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers.splice(index, 1);
        setCurrentAnswers(updatedAnswers);
    };

    const handleTextChange = (text: string, index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index].text = text;
        setCurrentAnswers(updatedAnswers);
    };

    const handleCheckBoxChange = (value: boolean, index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index].isRight = value;
        setCurrentAnswers(updatedAnswers);
    };


    const mapRef = useRef<MapView>(null);

    const mapsParams = useLocalSearchParams();
    useEffect(() => {

        (async () => {
            if (mapsParams.data) {
                const newRegion: Region = JSON.parse(mapsParams.data as string)
                setCurrentRegion(newRegion)
                console.log('New region is set', newRegion, 'Init is: ', initialRegion)
            }
            console.log('Denna laddas')
            await delay(10);
            setLoadMaps(true)
        })();
    }, [mapsParams.data])

    const cancelAddQuestions = () => {
        setMarkerToSave(undefined)
        setShowAddQuestions(false)
        setCurrentAnswers([])
        setQuestionText('')
        setEditMode(false)
    }

    const [loadMaps, setLoadMaps] = useState<boolean>(false);
    const [nextButtonActive, setNextButtonActive] = useState(false);
    const [nextButtonText, setNextButtonText] = useState('Add checkpoint by clicking on map');

    const activateNextButton = () => {
        setNextButtonActive(true);
        setNextButtonText('Next >>>')
    }

    const deactivateNextButton = () => {
        setNextButtonActive(false);
        setNextButtonText('Add checkpoint by clicking on map')
    }
    const handleNextPress = () => {
        if (nextButtonActive) {
            console.log('handleNextPress()', 'Next button active');
            handleSaveMarkers()
        } else {
            console.log('handleNextPress()', 'Next button is not active!!!');
        }

    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {loadMaps ? <>
                    <ButtonsComponent.CancelAndContinueButtons
                        onContinue={handleNextPress}
                        onCancel={handleDeleteAllMarkers}
                    />
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={currentRegion}
                        onPress={handleMapPress}
                        onMapReady={() => { console.log('Map ready') }}
                        onRegionChange={setCurrentRegion}
                    >
                        {
                            currentRoutes.map((route, index) => (
                                <Marker
                                    key={index}
                                    coordinate={{ latitude: route.marker.latitude, longitude: route.marker.longitude }}
                                    draggable
                                    onDragEnd={(event) => handleDragEnd(event, route.marker.id)}
                                    onPress={() => handleMarkerOnPress(route.marker)}
                                >
                                    <CircleMarker number={route.marker.markerOrder} />
                                </Marker>
                            ))
                        }
                    </MapView>
                </> : (
                    <View style={styles.loading}>
                        <ActivityIndicator size='large' />
                    </View>
                )}

                {/*<View style={styles.topContainer}>
                    <Button
                        title={nextButtonText}
                        onPress={handleNextPress}
                    />
                </View>          */}

                <View style={styles.newMarker}>
                    <AntDesign.Button
                        name="minussquareo"
                        size={35}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={handleGoToMapsPress} />
                    <View style={styles.markerMenu}>
                        {/*<AntDesign.Button
                            name="delete"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={handleDeleteAllMarkers}
                        />*/}
                        <FontAwesome.Button
                            name="random"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={() => {
                                setGenerateRandomCheckpointsVisible(true);
                            }}
                        />
                    </View>
                </View>

                {showAddQuestions ? (
                    <View style={styles.bottomOverlay}>
                        <View style={styles.row}>
                            <Text>{`Add question for checkpoint #${markerToSave?.id}`}</Text>
                            <Feather.Button
                                name="save"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                onPress={async () => {
                                    const isRightCount = currentAnswers.filter((ans) => ans.isRight).length;

                                    if (isRightCount <= 0) {
                                        Alert.alert('You need to tick at least one answer to be the right one')
                                        return
                                    }

                                    if (markerToSave) {
                                        const marker = markerToSave

                                        console.log('Is time to edit:', currentRoutes.filter(route => route.marker === marker).length > 0)

                                        const isTimeToEdit = currentRoutes.filter(route => route.marker === marker).length > 0

                                        if (isTimeToEdit) {
                                            setCurrentRoutes(prevRoutes =>
                                                prevRoutes.map(route =>
                                                    route.marker.id === marker.id ? {
                                                        ...route,
                                                        question: questionText,
                                                        answers: currentAnswers
                                                    } : route
                                                )
                                            );
                                        } else {
                                            const newRoute: RouteData = {
                                                marker: marker,
                                                question: questionText,
                                                answers: currentAnswers
                                            }
                                            setCurrentRoutes([...currentRoutes, newRoute]);
                                        }
                                    }

                                    cancelAddQuestions()

                                }}
                                style={styles.inputSaveButton}
                            />
                            <MaterialCommunityIcons.Button
                                name="database-plus"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                style={styles.inputSaveButton}
                                onPress={() => {
                                    setReturnRandomQuestion(false)
                                    setShowDbQuestionSelect(true)
                                }}
                            />
                            <FontAwesome.Button
                                name="random"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                style={styles.addAnswer}
                                onPress={async () => {
                                    setReturnRandomQuestion(true)
                                    setShowDbQuestionSelect(true)
                                }}
                            />

                            <Text>Set Marker order:</Text>
                            {markerToSave && <Picker
                                selectedValue={markerToSave.id}
                                onValueChange={(itemValue) =>
                                    //setMarkers(updateMarkerOrder(markers, markerToSave.id, itemValue))
                                    setCurrentRoutes(updateMarkerOrderForRoutes(currentRoutes, markerToSave.id, itemValue))
                                }
                                style={{ width: 100, height: 50, marginTop: -18 }}
                                mode={'dropdown'}
                            >
                                {
                                    currentRoutes.map((route, index) => (
                                        <Picker.Item key={index} label={route.marker.markerOrder.toString()} value={route.marker.markerOrder} />
                                    ))
                                }

                            </Picker>}

                        </View>

                        <TextInput
                            style={styles.input}
                            onChangeText={setQuestionText}
                            value={questionText}
                            placeholder="Enter question"
                            onSubmitEditing={addAnswerField}
                        />

                        <FontAwesome6.Button
                            name="add"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            style={styles.addAnswer}
                            onPress={addAnswerField}
                        />

                        {currentAnswers.map((field, index) => (
                            <View key={index} style={styles.fieldRow}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={`Answer #${index + 1}`}
                                    value={field.text}
                                    onChangeText={(text) => handleTextChange(text, index)}
                                    onSubmitEditing={addAnswerField}
                                    autoFocus={currentAnswers.length === index + 1}
                                />
                                <Checkbox
                                    value={field.isRight}
                                    onValueChange={(newVal) => handleCheckBoxChange(newVal, index)}
                                />
                                <Button
                                    title="Remove"
                                    onPress={() => removeAnswerField(index)}
                                />
                            </View>
                        ))}


                    </View>
                ) : null}

                {showNext && <NextRoutesOverlay
                    currentRoutes={currentRoutes}
                    onFinish={() => {
                        setCurrentRoutes([])
                        //setMarkers([])
                        setNextButtonText('Add checkpoint by clicking on map')
                    }}
                    onClose={() => {
                        setShowNext(false)
                    }}
                />}

                {showDbQuestionSelect &&
                    <AddQuestionFromDb
                        returnRandomQuestion={returnRandomQuestion}
                        onSelectedQuestion={async (question: any) => {
                            //console.log('selected question', question)
                            await delay(150)
                            setShowDbQuestionSelect(false)

                            setQuestionText(question.question)

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

                            setCurrentAnswers(answers)
                        }}
                    />
                }

                <RandomCheckPoints
                    isVisible={generateRandomCheckpointsVisible}
                    onFinnish={(checkpoints) => {
                        setGenerateRandomCheckpointsVisible(false)

                        if (!checkpoints) {
                            return
                        }

                        setCurrentRoutes(checkpoints as RouteData[])
                        activateNextButton()
                    }}
                    currentCoordinate={{ latitude: currentRegion.latitude, longitude: currentRegion.longitude }}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: '#eaeaea',
    },
    map: {
        flex: 1,
    },
    markerStyle: {
        padding: 10,
        paddingRight: 15
    },
    tinyLogo: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
    search: {
        position: 'absolute',
        top: 2,
        right: 0,
        width: 65,
        height: 50,
    },

    newMarker: {
        position: 'absolute',
        top: 50,
        right: 0,
        width: 65,
        height: 50,

    },
    markerMenu: {
        position: 'absolute',
        top: 50,
        right: 0,
        width: 55,
        height: 50,
    },
    addAnswer: {
        /*position: 'absolute',
        top: 5,
        right: 0,
        width: 55,
        height: 50,*/
        /*...StyleSheet.absoluteFillObject,*/
        alignSelf: 'flex-end',
        marginTop: -5,
    },
    addMarkerText: {
        margin: 10,
        paddingVertical: 5,
        borderWidth: 4,
        borderColor: '#20232a',
        borderRadius: 6,
        backgroundColor: '#61dafb',
        color: '#20232a',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    },
    topContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#61dafb',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    textInput: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        marginRight: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    inputSaveButton: {
        justifyContent: 'flex-end',
        marginTop: -5
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
