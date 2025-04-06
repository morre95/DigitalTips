import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CreateProvider } from "@/components/create_route/CreateContext";
import { CreateMapComponent } from "@/components/create_route/CreateMapComponent";
import CheckIfCreateInFokusComponent from '@/components/create_route/CheckIfCreateInFokusComponent'

export default function CreateRoutes() {

    return (
        <View style={styles.container}>
            <CreateProvider>
                <CreateMapComponent />
                <CheckIfCreateInFokusComponent />
            </CreateProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
