import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';


import Autocomplete from '@/components/Autocomplete';

import {MarkerImages} from '@/hooks/images'


import registerOrLogin, { globals } from "@/hooks/registerOrLogin";
import ApiTestJwtToken from "@/components/ApiTestJwtToken";

import {router, useLocalSearchParams} from 'expo-router';

interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
}

type Region = {
    latitude: number
    latitudeDelta: number
    longitude: number
    longitudeDelta: number
}

// TODO: Ladda in den rutt som blivit sparad på routes sidan
export default function Maps() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [showSearchButton, setShowSearchButton] = useState(true);

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
    }, [])



    const initialRegion : Region = {
        latitude: 58.317064,
        longitude: 15.102253,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0221,
    };

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
    const handleAddMarkerPress = (event: any) => {
        router.replace({
            pathname: "./Routes",
            params: { data : JSON.stringify(currentRegion) }
        })
    }

    const {routerData} = useLocalSearchParams();
    useEffect(() => {
        if (routerData) {
            const newRegion: Region = JSON.parse(routerData as string)
            setCurrentRegion(newRegion)
        }
    }, [routerData])

    const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <MapView
                    style={styles.map}
                    initialRegion={currentRegion}
                    onPress={handleMapPress}
                    onRegionChange={setCurrentRegion}
                >
                    {markers.map(marker => (
                        <Marker
                            key={marker.id}
                            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                            //title={marker.title}
                            //description={marker.description}
                            //draggable
                            //onDragEnd={(event) => handleDragEnd(event, marker.id)}
                            image={{uri: MarkerImages}}
                            //onPress={(event) => handleMarkerOnPress(event, marker)}
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
                        onSelect={(item: any) => {
                            console.log('Selected item:', item.name, ', id:', item.routeId)
                            setShowSearchButton(true)
                        }}
                        onSubmit={(item: string) => {
                            console.log('On Submit is item:', item)
                            setShowSearchButton(true)
                        }}
                    />
                ) }

                <View style={styles.newMarker}>
                    <AntDesign.Button
                        name="plussquareo"
                        size={35}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={handleAddMarkerPress} />
                </View>




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

});
