import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MapProvider } from "@/components/create_route/CreateContext";
import { MapComponent } from "@/components/create_route/MapComponent";

export default function CreateRoutes() {

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <MapProvider>
                    <MapComponent />
                </MapProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
