import React, { Component } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface INotificationStyle {
    backgroundColor?: string;
    color?: string;
}

interface IFlashMessageProp {
    notification: string;
    opacity: Animated.Value;
    offset: Animated.Value;
    notificationType: INotificationStyle;
    position: number
}

export default class FlashMessage extends Component<{}, IFlashMessageProp> {
    private _notificationRef: React.RefObject<View>;

    constructor(props: {}) {
        super(props);
        this.state = {
            notification: "",
            opacity: new Animated.Value(0),
            offset: new Animated.Value(0),
            notificationType: {backgroundColor: "tomato"},
            position: -200,
        };
        this._notificationRef = React.createRef<View>();
    }

    public flash(message: string, duration: number = 1500) {
        const notificationType = {...this.state.notificationType, backgroundColor: "#6495ed"}
        this.setState({notificationType: notificationType})
        this.flashBase(message, duration)
    }
    public success(message: string, duration: number = 1500) {
        const notificationType = {...this.state.notificationType, backgroundColor: "#228b22"}
        this.setState({notificationType: notificationType})
        this.flashBase(message, duration)
    }

    public error(message: string, duration: number = 1500) {
        const notificationType = {...this.state.notificationType, backgroundColor: "tomato"}
        this.setState({notificationType: notificationType})
        this.flashBase(message, duration)
    }

    public warning(message: string, duration: number = 1500) {
        const notificationType = {...this.state.notificationType, backgroundColor: "#ffd700"}
        this.setState({notificationType: notificationType})
        this.flashBase(message, duration)
    }

    private flashBase(message: string, duration: number) {
        this.setState({notification: message}, () => {
            const notificationNode = this._notificationRef.current;
            if (notificationNode) {
                notificationNode.measure((x, y, width, height, pageX, pageY) => {
                    this.state.offset.setValue(-height);
                    this.setState({position: 0})
                    console.log('Före animationen')
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
                    ]).start(() => this.setState({position: -200}));
                });
            }
        });
    }

    render() {
        const notificationStyle = {
            opacity: this.state.opacity,
            transform: [{ translateY: this.state.offset }],
            left: this.state.position,
            top: this.state.position,
            right: this.state.position,
        };

        return (
            <Animated.View style={[styles.notification, notificationStyle, this.state.notificationType]} ref={this._notificationRef}>
                <Text style={[styles.notificationText, this.state.notificationType.backgroundColor === "#ffd700" ? {color: '#000'}: {}]}>{this.state.notification}</Text>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    notification: {
        position: "absolute",
        paddingHorizontal: 7,
        paddingVertical: 15,
        left: -200,
        top: -200,
        right: -200,
        zIndex: 1290,
    },
    notificationText: {
        color: "#FFF",
    },
    success: {
        backgroundColor: "#7cfc00",
    },
    warning: {
        backgroundColor: "#ffd700",
    },
    error: {
        backgroundColor: "tomato",
    }
});