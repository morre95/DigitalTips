import React, {useRef, useEffect} from 'react';
import {StyleSheet, Animated} from 'react-native';
import {Marker} from 'react-native-maps';


interface IProps {
    coordinate: {
        latitude: number;
        longitude: number;
    },
    triggerShake: boolean;
    children: React.ReactNode;
    shakeIsFinished?: () => void;
    title?: string;
    image?: {uri: string};
    onPress: () => void;
    direction?: 'horizontal' | 'vertical';
}
const MarkerShaker = ({
    coordinate,
    triggerShake,
    shakeIsFinished,
    title, image,
    onPress,
    direction,
    children
}: IProps) => {
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (triggerShake) {
            Animated.sequence([

                Animated.timing(shakeAnimation, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: -1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start(shakeIsFinished);
        }
    }, [triggerShake, shakeAnimation]);


    const shakeInterpolation = shakeAnimation.interpolate({
        inputRange: [-1, 1],
        outputRange: [-10, 10],
    });

    return (
        <Marker
            coordinate={coordinate}
            title={title}
            onPress={onPress}
            image={image}
        >
            <Animated.View style={[styles.marker, {
                transform: [
                    direction === 'vertical' ?
                        { translateY: shakeInterpolation }:
                        { translateX: shakeInterpolation }
                ]
            }]}>
                {children}
            </Animated.View>
        </Marker>
    )
}

const styles = StyleSheet.create({
    marker: {
        /*height: 25,
        width: 25,
        backgroundColor: 'tomato',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',*/
    }
});

export default MarkerShaker;