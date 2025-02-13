import React, {useState, useEffect, useRef } from 'react';
import {StyleSheet, View, Text, Alert, Button, TextInput, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import Checkbox from 'expo-checkbox';

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import {MarkerImages} from '@/hooks/images'

import registerOrLogin, { globals } from "@/hooks/registerOrLogin";

import { router, useLocalSearchParams } from 'expo-router';

import NextRoutesOverlay from '@/components/NextRoutesOverlay'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
}

interface AnswerData {
    id: number;
    text: string;
    isRight: boolean;
}

// TODO: Det bör finnas checkpoint_order och name och eller description. Kolla in PHP kod för mer info under RouteController::add_new()
type RouteData = {
    marker: MarkerData;
    question: string;
    answers: AnswerData[];
}

type Region = {
    latitude: number
    latitudeDelta: number
    longitude: number
    longitudeDelta: number
}


export default function Maps() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    const [markerToSave , setMarkerToSave] = useState<MarkerData>();
    const [questionText, setQuestionText] = useState('');
    const [currentAnswers, setCurrentAnswers] = useState<AnswerData[]>([]);
    const [showAddQuestions, setShowAddQuestions] = useState(false);

    const [currentRoutes, setCurrentRoutes] = useState<RouteData[]>([]);

    const initialRegion: Region = {
        latitude: 58.317064,
        longitude: 15.102253,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0221,
    };

    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
    const [editMode, setEditMode] = useState(false);

    const [JWT_token, setJWT_token] = useState<string>();

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

    const handleMapPress = (event: any) => {
        if (editMode) {
            cancelAddQuestions()
            return
        }

        activateNextButton()

        const { coordinate } = event.nativeEvent;

        console.log('Japp här klickas det på kartan', coordinate);
        const newMarker: MarkerData = {
            id: markers.length + 1, //++markersCount,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            title: `Marker ${markers.length + 1}`,
            //title: `Marker ${markersCount}`,
            description: `Raderar markör ${markers.length + 1}, lat: ${coordinate.latitude}, lon: ${coordinate.longitude}`
        };
        setMarkers([...markers, newMarker]);
        //console.log(newMarker);

        setEditMode(true)
        Alert.alert(
            'Marker Added',
            'Add question or cancel',
            [
            {
                text: `Add Random question`,
                onPress: () => { console.log('Add Random question, not implemented yet'); },
                style: 'default'
            },
            {
                text: `Add question`,
                onPress: () => {handleAddQuestionToMarker(newMarker, null, [])},
                style: 'default'
            },
            {
                text: 'Cancel',
                onPress: () => {
                    console.log('Cancel Pressed')
                    setMarkers(prevMarkers =>
                        prevMarkers.filter(pMarker => pMarker.id !== newMarker.id)
                    )
                },
                style: 'cancel',
            },
        ],{
            cancelable: true,
            onDismiss: () => {
                setMarkers(prevMarkers =>
                    prevMarkers.filter(pMarker => pMarker.id !== newMarker.id)
                )
            }
        })
    };

    const handleMarkerOnPress = (marker: MarkerData) => {
        if (editMode) {
            return
        }

        setEditMode(true)

        let savedMarker : MarkerData | null = null;
        let question : string | null = null;
        let answers : AnswerData[];

        for (let [key, routerData] of Object.entries(currentRoutes)) {
            console.log(`Key: ${key}, routerData: `, routerData);
            if (routerData.marker.id === marker.id) {
                savedMarker = routerData.marker
                question = routerData.question
                answers = routerData.answers
                break
            }
        }

        const deleteMarker = () => {
            setMarkers(prevMarkers =>
                prevMarkers.filter(pMarker => pMarker.id !== marker.id)
            )
            setCurrentRoutes(prevRoutes =>
                prevRoutes.filter(route => route.marker.id !== marker.id)
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
                    onPress: () => {handleAddQuestionToMarker(marker, question, answers)},
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => {deleteMarker()},
                    style: 'destructive'
                },
            ],{
                cancelable: true,
                onDismiss: () =>
                    console.log('Add/Edit marker was dismissed by tapping outside of the alert dialog.')
            });
    }

    const handleAddQuestionToMarker = (marker: MarkerData, question: string | null, answers: AnswerData[]) => {
        console.log('Add question to marker', marker);
        setMarkerToSave(marker);
        setShowAddQuestions(true);
        if (question && answers.length > 0) {
            setQuestionText(question)
            setCurrentAnswers(answers)
        }
    }

    const handleDragEnd = (event: any, markerId: number) => {
        const { coordinate } = event.nativeEvent;

        setMarkers(prevMarkers =>
            prevMarkers.map(marker =>
                marker.id === markerId ? {
                    ...marker,
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude
                } : marker
            )
        );

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

        console.log('onDragEnd:', coordinate);
    }

    const handleGoToMapsPress = () => {

        router.replace({
            pathname: "./Maps",
            params: {
                routerData: JSON.stringify(currentRegion)
            }
        })
    }

    /*const [routeName, setRouteName] = useState<string>('')
    const [routeCity, setRouteCity] = useState<string>('')
    const [routeDescription, setRouteDescription] = useState<string>('')*/

    const [showNext, setShowNext] = useState<boolean>(false)
    //const handleSaveMarkers = async (event: any) => {
    const handleSaveMarkers = async () => {
        if (markers.length !== currentRoutes.length) {
            Alert.alert(
                'Antalet markers som har frågor stämmer inte överens med antalet markers',
                `Markers: ${markers.length}, RoutMarkers: ${currentRoutes.length}`);
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
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {text: 'Yes', onPress: () => {
                            setMarkers([])
                            setCurrentRoutes([])
                        }},
                ],
            {
            cancelable: true,
                onDismiss: () =>
                    console.log('Delete checkpoints alert was dismissed by tapping outside of the alert dialog.'),
        });

    }

    const addAnswerField = () => {
        setCurrentAnswers([...currentAnswers, { id: Date.now(), text: '', isRight: false }]);
    };

    const removeAnswerField = (index : number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers.splice(index, 1);
        setCurrentAnswers(updatedAnswers);
    };

    const handleTextChange = (text: string, index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index].text = text;
        setCurrentAnswers(updatedAnswers);
    };

    const handleCheckBoxChange = (value: boolean, index : number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index].isRight = value;
        setCurrentAnswers(updatedAnswers);
    };


    const mapRef = useRef<MapView>(null);

    const mapsParams = useLocalSearchParams();
    useEffect(() => {
        (async () => {
            const newRegion: Region = JSON.parse(mapsParams.data as string)
            setCurrentRegion(newRegion)
            console.log('New region is set', newRegion, 'Init is: ', initialRegion)

            await delay(10);
            setLoadMaps(true)
        })();
    }, [])

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
    const handleNextPress = () => {
        if (nextButtonActive) {
            console.log('Next button active');
            handleSaveMarkers()
        } else {
            console.log('Next button is not active!!!');
        }

    }
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {loadMaps ? <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={currentRegion}
                    onPress={handleMapPress}
                    onMapReady={() => {console.log('Map ready')}}
                    onRegionChange={setCurrentRegion}
                >
                    {markers.map(marker => (
                        <Marker
                            key={marker.id}
                            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                            //title={marker.title}
                            //description={marker.description}
                            draggable
                            onDragEnd={(event) => handleDragEnd(event, marker.id)}
                            image={{uri: MarkerImages}}
                            onPress={() => handleMarkerOnPress(marker)}
                        />
                    ))}
                </MapView> :(

                    <View style={styles.loading}>
                        <ActivityIndicator size='large' />
                    </View>
                )}


                <View style={styles.topContainer}>
                    {/*<Text style={styles.addMarkerText}>Add checkpoint by clicking on map</Text>*/}
                    <Button
                        title={nextButtonText}
                        onPress={handleNextPress}
                    />
                </View>

                <View style={styles.newMarker}>
                    <AntDesign.Button
                        name="minussquareo"
                        size={35}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={handleGoToMapsPress} />
                    <View style={styles.markerMenu}>
                        {/*<Feather.Button
                            name="save"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={handleSaveMarkers}
                        />*/}
                        <AntDesign.Button
                            name="delete"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={handleDeleteAllMarkers}
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

                                    const route: RouteData = {
                                        marker: markerToSave as MarkerData,
                                        question: questionText,
                                        answers: currentAnswers
                                    }

                                    setCurrentRoutes([...currentRoutes, route]);

                                    cancelAddQuestions()

                                }}
                                style={styles.inputSaveButton}
                            />
                            <MaterialIcons
                                name="cancel"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                style={styles.inputSaveButton}
                                onPress={cancelAddQuestions} />
                        </View>

                        <TextInput
                            style={styles.input}
                            onChangeText={setQuestionText}
                            value={questionText}
                            placeholder="Enter question"
                            onSubmitEditing={addAnswerField}
                        />
                        <Entypo.Button
                            name="add-to-list"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            style={styles.addAnswer}
                            onPress={addAnswerField}/>


                        <Text>Answer|is right?|remove</Text>
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
                {showNext && <NextRoutesOverlay currentRoutes={currentRoutes} onFinish={() => {
                        setCurrentRoutes([])
                        setMarkers([])
                        setNextButtonText('Add checkpoint by clicking on map')
                    }}
                    onClose={() => {
                        setShowNext(false)
                    }}
                />}
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
    addAnswer:{
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
