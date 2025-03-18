import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapProvider } from "@/components/create_route/CreateContext";
import { MapComponent } from "@/components/create_route/MapComponent";

export default function CreateRoutes() {

    return (
        <View style={styles.container}>
            <MapProvider>
                <MapComponent />
            </MapProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
