import React, { useState, useEffect, FC } from 'react';
import { StyleSheet, View, Text, Alert, Button, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MarkerImages from "@/hooks/images";

interface Props {
    onPress: (item: any) => void;
}

const Map: React.FC<Props> = ({ onPress }) => {
    const initialRegion  = {
        latitude: 58.317064,
        longitude: 15.102253,
        latitudeDelta: 0.0622,
        longitudeDelta: 0.0221,
    };
    return (
        <MapView
            style={styles.map}
            initialRegion={initialRegion}
            onPress={onPress}
        >

        </MapView>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
})

export default Map;