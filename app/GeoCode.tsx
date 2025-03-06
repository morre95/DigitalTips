import React from 'react';
import {StyleSheet, View} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';


const initialRegion: Region = {
    latitude: 58.317435384,
    longitude: 15.123921353,
    latitudeDelta: 0.0622,
    longitudeDelta: 0.0700,
};

interface Region {
    latitude: number;
    latitudeDelta: number;
    longitude: number;
    longitudeDelta: number;
}

interface Geocode {
    place_id: number
    licence: string
    osm_type: string
    osm_id: number
    lat: string
    lon: string
    display_name: string
    address: Address
    boundingbox: string[]
}

interface Address {
    road: string
    isolated_dwelling: string
    town?: string
    municipality?: string
    county: string
    "ISO3166-2-lvl4": string
    postcode: string
    country: string
    country_code: string
}

async function fetchJson(url: string): Promise<Geocode> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
    }
    return await response.json();
}

export default function GeoCode() {

    const handleOnPress = async (event: any) => {
        const { coordinate } = event.nativeEvent;
        //console.log(coordinate)

        const url = `https://geocode.maps.co/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&api_key=6798abea1f158931711813wjg400aa6`
        //console.log(url)

        const result = await fetchJson(url);
        if (!result) {
            console.error(`Could not find location: ${url}`);
        } else if (result.address.town) {
            console.log('town: ', result.address.town, ', isolated_dwelling: ', result.address.isolated_dwelling);
        } else if (result.address.municipality) {
            console.log('municipality:', result.address.municipality, ', isolated_dwelling: ', result.address.isolated_dwelling);
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleOnPress}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
})