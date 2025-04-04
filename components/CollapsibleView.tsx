import React, { useState, useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';

interface Props {
    title: string;
    children: React.ReactNode;
}

const CollapsibleView = ({ title, children }: Props) => {
    //const [collapsed, setCollapsed] = useState(true);
    //const [openHeight, setOpenHeight] = useState(0);
    const rotationAnimation = useRef(new Animated.Value(1)).current;
    const heightAnimation = useRef(new Animated.Value(0)).current;
    let openHeight = 320;

    const startAnimation = () => {
        /*if (collapsed) {
            Animated.timing(rotationAnimation, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(rotationAnimation, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
        setCollapsed(!collapsed)*/
        rotationAnimation.stopAnimation((currentRotation) => {
            const isClosed = currentRotation === 0;
            Animated.parallel([
                // Rotationsanimation med native driver
                Animated.timing(rotationAnimation, {
                    toValue: isClosed ? 1 : 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                // Höjdanimation utan native driver
                Animated.timing(heightAnimation, {
                    toValue: isClosed ? 1 : 0,
                    duration: 500,
                    useNativeDriver: false,
                }),
            ]).start();
        });
    };

    const rotateX = rotationAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg']
    });

    const height = heightAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [openHeight, 0]
    });

    const setLayoutHeight = (event: any) => {
        //setOpenHeight(event.nativeEvent.layout.height);
        //setOpenHeight(360);
        const height = event.nativeEvent.layout.height;
        if (height > 0) {
            //setOpenHeight(Math.max(openHeight, height));

            openHeight = Math.max(openHeight, height);
        }
    }

    return (
        <View>
            <TouchableWithoutFeedback onPress={startAnimation}>
                <View>
                    <Text>{title}, Height: {openHeight}</Text>
                </View>
            </TouchableWithoutFeedback>
            <Animated.View style={[{overflow: 'hidden'}, { height: height }]} onLayout={setLayoutHeight}>
                <Animated.View style={[{ transform: [{ rotateX }] }]}>
                    {children}
                </Animated.View>
            </Animated.View>
        </View>
    );

    /*const [collapsed, setCollapsed] = useState(true);
    const [viewHeight, setViewHeight] = useState(0);
    const animation = useRef(new Animated.Value(0));

    const toggleCollapse = () => {
        if (collapsed) {
            Animated.timing(animation.current, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(animation.current, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
        setCollapsed(!collapsed);
    };

    const heightInterpolate = animation.current.interpolate({
        inputRange: [0, 1],
        outputRange: [0, viewHeight]
    });

    const setLayoutHeight = (event: any) => {
        setViewHeight(event.nativeEvent.layout.height);
    }

    return (
        <View>
            <TouchableWithoutFeedback onPress={toggleCollapse}>
                <View>
                    <Text>{title}</Text>
                </View>
            </TouchableWithoutFeedback>
            <Animated.View style={{ height: heightInterpolate }} onLayout={setLayoutHeight}>
                {children}
            </Animated.View>
        </View>
    );*/
};

export default CollapsibleView;