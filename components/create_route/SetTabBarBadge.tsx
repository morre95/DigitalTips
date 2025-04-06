import React, { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { useCreateDispatch } from "@/components/create_route/CreateContext";

const SetTabBarBadge = () => {
    const {state} = useCreateDispatch();
    const navigation = useNavigation();
    useEffect(() => {
        if (state.checkpoints.length > 0) {
            navigation.setOptions({tabBarBadge: state.checkpoints.length})
        } else {
            navigation.setOptions({tabBarBadge: null})
        }
    }, [navigation, state.checkpoints]);
    return <></>
}

export default SetTabBarBadge;