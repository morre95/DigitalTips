import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from 'expo-router';
import {useCreateDispatch} from "@/components/create_route/CreateContext";

const CheckIfCreateInFokusComponent = () => {
    const navigation = useNavigation();
    const {state, dispatch} = useCreateDispatch();

    useEffect(() => {
        return navigation.addListener('blur', () => {
            if (state.checkpoints.length > 0) {
                Alert.alert(
                    `You have ${state.checkpoints.length} unsaved checkpoints`,
                    'Do you want to delete this route permanently', [
                    {
                        text: 'Delete route',
                        onPress: () => dispatch({type: 'deleteAll'}),
                        style: 'cancel',
                    },
                    {
                        text: 'Go Back',
                        onPress: () => navigation.goBack()
                    },
                ]);
            }
        });
    }, [navigation, state.checkpoints]);


    return <></>
};

export default CheckIfCreateInFokusComponent;

