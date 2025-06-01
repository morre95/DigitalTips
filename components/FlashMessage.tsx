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

interface IQueueItem {
    message: string;
    duration: number;
    notificationType: { backgroundColor: string };
}

export default class FlashMessage extends Component<{}, IFlashMessageProp> {
    private _notificationRef = React.createRef<View>();
    private queue: IQueueItem[] = [];
    private isAnimating = false;

    constructor(props: {}) {
        super(props);
        this.state = {
            notification: '',
            opacity: new Animated.Value(0),
            offset: new Animated.Value(0),
            notificationType: { backgroundColor: 'tomato' },
            position: -200,
        };
    }

    // Publika metoder: lägg bara in i kön och sätt rätt typ
    public flash(message: string, duration: number = 1500) {
        this.enqueue(message, duration, { backgroundColor: '#6495ed' });
    }
    public success(message: string, duration: number = 1500) {
        this.enqueue(message, duration, { backgroundColor: '#228b22' });
    }
    public error(message: string, duration: number = 1500) {
        this.enqueue(message, duration, { backgroundColor: 'tomato' });
    }
    public warning(message: string, duration: number = 1500) {
        this.enqueue(message, duration, { backgroundColor: '#ffd700' });
    }

    // Lägg in i kön och försök starta playback
    private enqueue(message: string, duration: number, notificationType: { backgroundColor: string }) {
        this.queue.push({ message, duration, notificationType });
        this.processQueue();
    }

    // Om inget animeras, ta nästa item och visa det
    private processQueue() {
        if (this.isAnimating || this.queue.length === 0) return;

        const { message, duration, notificationType } = this.queue.shift()!;
        this.isAnimating = true;
        this.setState({ notificationType }, () => {
            this.showNotification(message, duration);
        });
    }

    public clearQueue() {
        this.queue = [];
    }

    // Här ligger din gamla flashBase kod, utan att hantera kön
    private showNotification(message: string, duration: number) {
        this.setState({ notification: message }, () => {
            const node = this._notificationRef.current;
            if (!node) return;

            node.measure((x, y, width, height) => {
                this.state.offset.setValue(-height);
                this.setState({ position: 0 });

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
                ]).start(() => {
                    // När animationen är klar, återställ position och fortsätt i kön
                    this.setState({ position: -200 }, () => {
                        this.isAnimating = false;
                        this.processQueue();
                    });
                });
            });
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
            <Animated.View
                style={[styles.notification, notificationStyle, this.state.notificationType]}
                ref={this._notificationRef}
            >
                <Text
                    style={[
                        styles.notificationText,
                        this.state.notificationType.backgroundColor === '#ffd700'
                            ? { color: '#000' }
                            : {},
                    ]}
                >
                    {this.state.notification}
                </Text>
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