import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CreateProvider } from "@/components/create_route/CreateContext";
import { CreateMapComponent } from "@/components/create_route/CreateMapComponent";
import CheckIfCreateInFokus from '@/components/create_route/CheckIfCreateInFokus';
import SetTabBarBadge from '@/components/create_route/SetTabBarBadge';

export default function CreateRoutes() {

    return (
        <View style={styles.container}>
            <CreateProvider>
                <CreateMapComponent />
                <CheckIfCreateInFokus />
                <SetTabBarBadge />
            </CreateProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
