import React, { Component } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface AnimatedNotificationState {
    notification: string;
    opacity: Animated.Value;
    offset: Animated.Value;
}

export default class FlashMessage extends Component<{}, AnimatedNotificationState> {
    private _notificationRef: React.RefObject<View>;

    constructor(props: {}) {
        super(props);;
        this.state = {
            notification: "",
            opacity: new Animated.Value(0),
            offset: new Animated.Value(0),
        };
        this._notificationRef = React.createRef<View>();
    }

    public flash = (message: string, duration: number = 1500) => {
        this.setState({ notification: message }, () => {
            const notificationNode = this._notificationRef.current;
            if (notificationNode) {
                notificationNode.measure((x, y, width, height, pageX, pageY) => {
                    this.state.offset.setValue(-height);
                    Animated.sequence([
                        Animated.parallel([
                            Animated.timing(this.state.opacity, {
                                toValue: 1,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                            Animated.timing(this.state.offset, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.delay(duration),
                        Animated.parallel([
                            Animated.timing(this.state.opacity, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                            Animated.timing(this.state.offset, {
                                toValue: -height,
                                duration: 300,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]).start();
                });
            }
        });
    };

    render() {
        const notificationStyle = {
            opacity: this.state.opacity,
            transform: [{ translateY: this.state.offset }],
        };

        return (
            <Animated.View style={[styles.notification, notificationStyle]} ref={this._notificationRef}>
                <Text style={styles.notificationText}>{this.state.notification}</Text>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    notification: {
        position: "absolute",
        paddingHorizontal: 7,
        paddingVertical: 15,
        left: 0,
        top: 0,
        right: 0,
        backgroundColor: "tomato",
    },
    notificationText: {
        color: "#FFF",
    },
});