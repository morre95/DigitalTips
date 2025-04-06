import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CreateProvider } from "@/components/create_route/CreateContext";
import { CreateMapComponent } from "@/components/create_route/CreateMapComponent";
import PageInFokusComponent from '@/components/create_route/PageInFokusComponent'

export default function CreateRoutes() {

    return (
        <View style={styles.container}>
            <CreateProvider>
                <CreateMapComponent />
                <PageInFokusComponent />
            </CreateProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
