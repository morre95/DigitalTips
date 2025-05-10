import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, TextInput, Modal, TouchableOpacity, ToastAndroid } from 'react-native';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import {getRouteInfo, RouteInfo} from "@/functions/api/Get";
import {useToken} from "@/components/login/LoginContext";

import { Link } from 'expo-router';
import Spacer from "@/components/Spacer";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


interface GameUrlComponentProps {
    visible: boolean;
    close: () => void;
}

export default function GameUrlComponent({visible, close}: GameUrlComponentProps) {
    const [routeId, setRouteId] = useState<number | null>(null);
    const [url, setUrl] = useState<string>('');
    const {token} = useToken();
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

    // Start the app with URL
    useEffect(() => {
        let subscription: any
        (async () => {
            const text = await Linking.getInitialURL();
            if (text) {
                await handleUrl(text);
            }

            subscription = Linking.addEventListener('url', async (event) => {
                await handleUrl(event.url);
            });
        })();

        return () => subscription.remove();
    }, []);

    const fetchCopiedText = async () => {
        const text = await Clipboard.getStringAsync();
        await handleUrl(text);
    };

    const handleUrl = async (url: string) => {
        if (!isValidUrl(url)) {
            showToastMsg('The url has the wrong format');
            showToastMsg('The right format: something://something?id=[route id]');
        }

        const { queryParams} = Linking.parse(url);
        if (queryParams?.id) {
            const id = Number(queryParams.id);
            setRouteId(id);
            const result = await getRouteInfo(id, token as string);
            if (!result.error) {
                setRouteInfo(result.routeInfo);
            } else {
                setRouteInfo(null);
            }
        } else {
            showToastMsg(`Can not find any game with: '${url}'`);
        }
    }

    const handleClose = () => {
        close();
        setRouteId(null);
    }

    const showToastMsg = (message: string) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
        );
    };

    const isValidUrl = (urlString: string): boolean => {
        const urlRegex = /^[A-Za-z0-9.-]+:\/\/[A-Za-z0-9.-]+[?]id=\d+$/
        return urlRegex.test(urlString);
    }


    // appToTheApp://gameToPlay?id=5

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}>
            <TouchableOpacity
                onPress={handleClose}
                style={styles.centeredView}>
                <View style={styles.container}>
                    {routeId ? (
                        <View>
                            {routeInfo ?
                                <>
                                    <Text>{routeInfo.name}</Text>
                                    <Text>{routeInfo.city}</Text>
                                    <Spacer size={10} />
                                    <Link onPress={handleClose} href={{
                                        pathname: '/Maps',
                                        params: { routeId: routeId },
                                    }}
                                    >
                                        <MaterialCommunityIcons name="gamepad-square-outline" size={60} color="black" />
                                    </Link>
                                </>
                                :
                                <Text> Hämtar data för ID: {routeId}… </Text>
                            }
                            <Spacer size={20} />
                            <Button title="Try again" onPress={() => setRouteId(null)} />
                        </View>
                    ) : (
                        <View>
                            <Text>Example: example://startGame?id=4</Text>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <TextInput
                                        style={styles.input}
                                        value={url}
                                        onChangeText={setUrl}
                                        placeholder={'URL'}
                                        onSubmitEditing={() => handleUrl(url)}
                                    />
                                <TouchableOpacity onPress={() => handleUrl(url)}>
                                    <Text style={styles.linkText}>Check</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.button} onPress={fetchCopiedText}>
                                <Text style={styles.buttonText}>Paste URL</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        flex: 1,
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        alignItems: 'stretch'
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff'
    },
    linkText: {
        marginTop: 20,
        color: '#0569FF'
    }
});