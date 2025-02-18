import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';

import Autocomplete from '@/components/Autocomplete';

import {MarkerImages} from '@/hooks/images'

import registerOrLogin, { globals } from "@/hooks/registerOrLogin";
import ApiTestJwtToken from "@/components/ApiTestJwtToken";

import {router, useLocalSearchParams} from 'expo-router';

import checkpointsData from "../assets/checkpoints.json";   //TODO: Remove later this json import, since we wont use it in the future

import getJson, {SearchResponse, getCheckpoints} from '@/hooks/api/Get'

import CheckPoint from '@/components/CheckPoint'


type Region = {
    latitude: number
    latitudeDelta: number
    longitude: number
    longitudeDelta: number
}

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

// TODO: Ladda in den rutt som blivit sparad på routes sidan
export default function Maps() {
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
    const [showSearchButton, setShowSearchButton] = useState(true);

    const initialRegion: Region = {
        latitude: 58.317435384,
        longitude: 15.123921353,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0700,
    };

    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

    const [JWT_token, setJWT_token] = useState<string>();
    /*
        {JWT_token ? (
            <ApiTestJwtToken token={JWT_token} />
        ) : null}
    */

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
    }, []);

    const {routerData} = useLocalSearchParams();
    useEffect(() => {
        if (routerData) {
            const newRegion: Region = JSON.parse(routerData as string)
            setCurrentRegion(newRegion)
        }
    }, [routerData]);

    //TODO: This will removed in the future, but the code in here can be used to load the checkpoints used for 
    const handleLoadPress = (event: any) => {
        console.log("loading json file");

        try{
            const checkpoints: Checkpoint[] = checkpointsData.checkpoints.map((cp: any) => ({
                ...cp,
                created_at: new Date(cp.created_at),
                updated_at: new Date(cp.updated_at),
            }));
            setCheckpoints(checkpoints);

        } catch (error) {
            console.error("An error occurred", error);
        }
    }

    const handleMapPress = (event: any) => {
        if (!showSearchButton) {
            setShowSearchButton(true)
            return
        }

        const { coordinate } = event.nativeEvent;

        console.log(`Klickat på karten vid lat: ${coordinate.latitude}, lon: ${coordinate.longitude}`);
    };

    const handleSearchPress = (event: any) => {
        setShowSearchButton(!showSearchButton);
    }

    const handleAddMarkerPress = () => {
        router.replace({
            pathname: "./Routes",
            params: { data : JSON.stringify(currentRegion) }
        })
    }

    const handelAutoOnSelect = async (item: SearchResponse) => {
        //console.log('Selected item:', item.name, ', id:', item.routeId)
        setShowSearchButton(true)
        setCheckpoints([]);
        type Markers = {
            checkpoints: Checkpoint[];
        }
        const markers = await getCheckpoints<Markers>(item.routeId)

        setCheckpoints(markers.checkpoints);
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={currentRegion}
                    onPress={handleMapPress}
                    onRegionChange={setCurrentRegion}
                    showsUserLocation={true}
                    onLongPress={() => {
                        Alert.alert('Create new routes', 'Du you want to create new route?', [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Create new routes', 'Cancel Pressed'),
                                style: 'cancel',
                            },
                            {text: 'OK', onPress: () => router.navigate({
                                    pathname: "./Routes",
                                    params: { data : JSON.stringify(currentRegion) }
                                })},
                        ]);
                    }}
                >
                    {checkpoints.map(checkpoint => (
                        <CheckPoint
                            key={checkpoint.checkpoint_id}
                            checkpoint={checkpoint}
                            onQuestion={(question: Question) => {
                                console.log('onQuestion:', question);
                            }}
                        />
                    ))}
                </MapView>
                
                {showSearchButton ? (
                    <View style={styles.search}>
                        <FontAwesome.Button
                            name="search"
                            size={35}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={handleSearchPress} />
                    </View>
                ) : (
                    <Autocomplete
                        data={['Apple', 'Banana', 'Orange', 'Grapes', 'Pineapple', 'Foo', 'Bar']}
                        onSelect={handelAutoOnSelect}
                        onSubmit={(item: string) => {
                            console.log('On Submit is item:', item)
                            setShowSearchButton(true)
                        }}
                    />
                ) }

                {/*<View style={styles.newMarker}>
                    <AntDesign.Button
                        name="plussquareo"
                        size={35}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={handleAddMarkerPress} />
                </View>

                <View style={styles.loadButton}>
                    <AntDesign.Button
                        name="hdd"
                        size={35}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={handleLoadPress}/>
                </View>*/}

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
        left: 0,
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

    loadButton: {
        position: 'absolute',
        top: 100,
        right: 0,
        width: 65,
        height: 50,
    },

});
