import React, { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { useCreateDispatch } from "@/components/create_route/CreateContext";

const SetTabBarBadge = () => {
    const {state} = useCreateDispatch();
    const navigation = useNavigation();
    useEffect(() => {
        const numberOfCheckpoints = state.checkpoints.length;
        if (numberOfCheckpoints > 0) {
            navigation.setOptions(
    {
                tabBarBadge: numberOfCheckpoints,
                tabBarBadgeStyle: {
                    color: '#fff',
                    backgroundColor: '#1f9ffb',
                }
            })
        } else {
            navigation.setOptions({tabBarBadge: null})
        }
    }, [navigation, state.checkpoints]);
    return <></>
}

export default SetTabBarBadge;