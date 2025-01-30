import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, Image, Button, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import Checkbox from 'expo-checkbox';


import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let markersCount = 0;


function generateRandomColor(): string {
    const letters: string = '0123456789ABCDEF';
    let color: string = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomStr(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    color: string;
    str: string;
}

interface AnswerData {
    id: number;
    value: string;
    isRight: boolean;
}

export default function Maps() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [showSearch, setShowSearch] = useState(true);
    const [showAddMarker, setShowAddMarker] = useState(true);
    const [addMarker, setAddMarker] = useState(false);

    const [currentMarkerId, setCurrentMarkerId] = useState(0);
    const [questionText, onChangeQuestionText] = useState('');
    //const [answers, setAnswers] = useState<AnswerData[]>([]);
    const [showAddQuestions, setShowAddQuestions] = useState(false);


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
                description: `Raderar markör ${markers.length + 1}, lat: ${coordinate.latitude}, lon: ${coordinate.longitude}`,
                color: generateRandomColor(),
                str: randomStr(markers.length % 2 == 0 ? 2 : 3)
            };
            setMarkers([...markers, newMarker]);
            console.log(newMarker);
        }

    };

    const handleMarkerOnPress = (event: any, markerId: number) => {
        const deleteMarker = () => {
            setMarkers(prevMarkers =>
                prevMarkers.filter(marker => marker.id !== markerId)
            );
        }
        Alert.alert('Delete marker', `Do you want to add question or delete checkpoint ${markerId}`, [
            {
                text: 'Add question',
                onPress: () => {handleAddQuestionToMarker(event, markerId)},
            },
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {text: 'Delete', onPress: () => {deleteMarker()}},
        ]);
    }

    const handleAddQuestionToMarker = (event: any, markerId: number) => {
        console.log('Add question to marker', markerId);
        setCurrentMarkerId(markerId);
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
        Alert.alert("jo då här klickas det på sök allt")
    }
    const handleAddMarkerPress = (event: any) => {
        setShowSearch(!showSearch);
        setAddMarker(!addMarker);
    }
    const handleSaveMarkers = (event: any) => {

    }

    const handleDeleteAllMarkers = (event: any) => {
        Alert.alert('Delete checkpoints', 'Du you really want to delete all checkpoints?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {text: 'Yes', onPress: () => setMarkers([])},
        ]);

    }

    const [currentAnswers, setCurrentAnswers] = useState<AnswerData[]>([]);

    // Lägg till ett nytt fält (med text och checkbox-värde)
    const addField = () => {
        setCurrentAnswers([...currentAnswers, { id: Date.now(), value: '', isRight: false }]);
    };

    // Ta bort ett fält på en viss index
    const removeField = (index : number) => {
        const updatedFields = [...currentAnswers];
        updatedFields.splice(index, 1);
        setCurrentAnswers(updatedFields);
    };

    // Uppdaterar textvärdet i ett fält
    const handleTextChange = (text: string, index: number) => {
        const updatedFields = [...currentAnswers];
        updatedFields[index].value = text;
        setCurrentAnswers(updatedFields);
    };

    // Uppdaterar checkbox-värdet i ett fält
    const handleCheckBoxChange = (value: boolean, index : number) => {
        const updatedFields = [...currentAnswers];
        updatedFields[index].isRight = value;
        setCurrentAnswers(updatedFields);
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
                            image={{uri: 'data:image/png;base64,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'}}
                            onPress={(event) => handleMarkerOnPress(event, marker.id)}
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
                ) : null }

                {showAddQuestions ? (
                    <View style={styles.bottomOverlay}>

                        <Text>{`Add question for checkpoint #${currentMarkerId}`}</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={onChangeQuestionText}
                            value={questionText}
                            placeholder="Enter question"
                        />
                        <Entypo.Button
                            name="add-to-list"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            style={styles.addAnswer}
                            onPress={addField}/>

                        <Text>Answer|is right?|remove</Text>
                        {currentAnswers.map((field, index) => (
                            <View key={index} style={styles.fieldRow}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={`Answer #${index + 1}`}
                                    value={field.value}
                                    onChangeText={(text) => handleTextChange(text, index)}
                                />
                                <Checkbox
                                    value={field.isRight}
                                    onValueChange={(newVal) => handleCheckBoxChange(newVal, index)}
                                />
                                <Button
                                    title="Remove"
                                    onPress={() => removeField(index)}
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
});
