import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, Button, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import Checkbox from 'expo-checkbox';

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';


import Autocomplete from '@/components/Autocomplete';

import MarkerImages from '../hooks/images'


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let markersCount = 0;

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

type RouteData = {
    marker: MarkerData;
    question: string;
    answers: AnswerData[];
}



export default function Maps() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [showSearch, setShowSearch] = useState(true);
    const [showAddMarker, setShowAddMarker] = useState(true);
    const [addMarker, setAddMarker] = useState(false);

    const [markerToSave , setMarkerToSave] = useState<MarkerData>();
    const [questionText, setQuestionText] = useState('');
    const [currentAnswers, setCurrentAnswers] = useState<AnswerData[]>([]);
    const [showAddQuestions, setShowAddQuestions] = useState(false);

    const [currentRoutes, setCurrentRoutes] = useState<RouteData[]>([]);



    const [editMode, setEditMode] = useState(false);


    const initialRegion = {
        latitude: 58.317064,
        longitude: 15.102253,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0221,
    };

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;

        if (addMarker) {
            // Skapa en ny marker
            const newMarker: MarkerData = {
                //id: markers.length + 1,
                id: ++markersCount,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                //title: `Marker ${markers.length + 1}`,
                title: `Marker ${markersCount}`,
                description: `Raderar markör ${markers.length + 1}, lat: ${coordinate.latitude}, lon: ${coordinate.longitude}`
            };
            setMarkers([...markers, newMarker]);
            console.log(newMarker);
        }

    };

    const handleMarkerOnPress = (event: any, currentMarker: MarkerData) => {
        if (!editMode) {
            return;
        }

        const deleteMarker = () => {
            setMarkers(prevMarkers =>
                prevMarkers.filter(marker => marker.id !== currentMarker.id)
            );
        }
        Alert.alert('Delete marker', `Do you want to add question or delete checkpoint ${currentMarker.id}`, [
            {
                text: 'Add question',
                onPress: () => {handleAddQuestionToMarker(event, currentMarker)},
            },
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {text: 'Delete', onPress: () => {deleteMarker()}},
        ]);
    }

    const handleAddQuestionToMarker = (event: any, currentMarker: MarkerData) => {
        console.log('Add question to marker', currentMarker);
        setMarkerToSave(currentMarker);
        setShowAddQuestions(true);
    }

    const handleDragEnd = (event: any, markerId: number) => {
        const { coordinate } = event.nativeEvent;

        setMarkers(prevMarkers =>
            prevMarkers.map(marker =>
                marker.id === markerId ? { ...marker, latitude: coordinate.latitude, longitude: coordinate.longitude } : marker
            )
        );

        console.log('onDragEnd:', coordinate);

        let newMarkers: MarkerData[] = [];
        setMarkers(prevState => newMarkers = prevState);

        // Väntar en sekund för att försäkra mig om att ändringen har gått igenom
        (async () => {
            await delay(1000);
            console.log('newMarkers delayed:', newMarkers);
        })();

    }

    const handleSearchPress = (event: any) => {
        setShowAddMarker(!showAddMarker);
    }
    const handleAddMarkerPress = (event: any) => {
        setShowSearch(!showSearch);
        setAddMarker(!addMarker);

        setEditMode(!editMode);
    }
    const handleSaveMarkers = (event: any) => {
        if (markers.length !== currentRoutes.length) {
            Alert.alert('Antalet markers som har frågor stämmer inte överens med antalet markers', `Markers: ${markers.length}, RoutMarkers: ${currentRoutes.length}`);
        } else {
            Alert.alert('Det är okej att spara')
        }
    }

    const handleDeleteAllMarkers = (event: any) => {
        Alert.alert('Delete checkpoints', 'Du you really want to delete all checkpoints?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {text: 'Yes', onPress: () => {
                setMarkers([])
                setCurrentRoutes([])
            }},
        ]);

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

    const addMarkerIcon = showSearch ? 'plussquareo' : 'minussquareo'
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    onPress={handleMapPress}
                >
                    {markers.map(marker => (
                        <Marker
                            key={marker.id}
                            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                            //title={marker.title}
                            //description={marker.description}
                            draggable
                            onDragEnd={(event) => handleDragEnd(event, marker.id)}
                            image={{uri: MarkerImages.MarkerImages}}
                            onPress={(event) => handleMarkerOnPress(event, marker)}
                        />
                    ))}
                </MapView>
                {showSearch ? (
                    <View style={styles.search}>
                        <FontAwesome.Button
                            name="search"
                            size={35}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={handleSearchPress} />
                    </View>
                ) : (
                    <View style={styles.topContainer}>
                        <Text style={styles.addMarkerText}>Add checkpoint by clicking on map</Text>
                        <View style={styles.markerMenu}>
                            <Feather.Button
                                name="save"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                onPress={handleSaveMarkers}
                                />
                            <AntDesign.Button
                                name="delete"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                onPress={handleDeleteAllMarkers}
                            />
                        </View>
                    </View>
                )
                }

                {showAddMarker ? (
                    <View style={styles.newMarker}>
                        <AntDesign.Button
                            name={addMarkerIcon}
                            size={35}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={handleAddMarkerPress} />
                    </View>
                ) : (
                    <Autocomplete
                        data={['Apple', 'Banana', 'Orange', 'Grapes', 'Pineapple', 'Foo', 'Bar']}
                        onSelect={(item: string) => console.log('Selected item:', item)}
                        onSubmit={(item: string) => console.log('On Submit is item:', item)}
                    />
                ) }

                {showAddQuestions ? (
                    <View style={styles.bottomOverlay}>
                        <View style={styles.row}>
                            <Text>{`Add question for checkpoint #${markerToSave}`}</Text>
                            <Feather.Button
                                name="save"
                                size={24}
                                color="black"
                                backgroundColor="rgba(52, 52, 52, 0)"
                                onPress={(e) => {
                                    Alert.alert('Saving, but only in memory')
                                    setShowAddQuestions(false);
                                    const route: RouteData = {
                                        marker: markerToSave as MarkerData,
                                        question: questionText,
                                        answers: currentAnswers
                                    }
                                    setMarkerToSave(undefined)

                                    setCurrentRoutes([...currentRoutes, route]);

                                    setCurrentAnswers([])
                                    setQuestionText('')
                                }}
                                style={styles.inputSaveButton}
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            onChangeText={setQuestionText}
                            value={questionText}
                            placeholder="Enter question"
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
        top: 100,
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
});
