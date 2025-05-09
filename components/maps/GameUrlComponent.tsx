import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, TextInput, Modal } from 'react-native';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import {getRouteInfo, RouteInfo} from "@/functions/api/Get";
import {useToken} from "@/components/login/LoginContext";

import { Link } from 'expo-router';
import Spacer from "@/components/Spacer";


interface GameUrlComponentProps {
    visible: boolean;
    close: () => void;
}

export default function GameUrlComponent({visible, close}: GameUrlComponentProps) {
    const [routeId, setRouteId] = useState<number | null>(null);
    const [url, setUrl] = useState<string>('');
    const {token} = useToken();
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

    // Start app with URL
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
        const { queryParams } = Linking.parse(url);
        if (queryParams?.id) {
            const id = Number(queryParams.id)
            setRouteId(id);
            const result = await getRouteInfo(id, token as string);
            if (!result.error) {
                setRouteInfo(result.routeInfo);
            } else {
                setRouteInfo(null);
            }
        }
    }

    const handleClose = () => {
        close();
        setRouteId(null);
    }

    // appToTheApp://gameToPlay?id=5

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}>
            <View style={styles.centeredView}>
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
                                        Start game
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
                            <TextInput
                                style={styles.input}
                                value={url}
                                onChangeText={setUrl}
                                placeholder={'URL'}
                                onSubmitEditing={() => handleUrl(url)}
                            />
                            <Button title="View copied text" onPress={fetchCopiedText} />
                        </View>
                    )}
                </View>
            </View>
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
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});