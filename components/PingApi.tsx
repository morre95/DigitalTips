import React, {ComponentRef, useRef} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {pingServer} from '@/functions/api/Get';
import FlashMessage from "@/components/FlashMessage";

type PingApiProps = {
    ping: string;
    timestamp: Date;
    timeTaken?: number;
}

const PingApi = () => {
    const flashMessageRef = useRef<ComponentRef<typeof FlashMessage>>(null);

    const handelPingServer = async () => {
        const start = new Date().getTime();
        const result = await pingServer<PingApiProps>();
        const end = new Date().getTime();
        result.timeTaken = end - start;
        flashMessageRef.current?.success(`Ping: ${result.timeTaken} ms, Server time: ${new Date(result.timestamp).toLocaleString()}`, 5000);
    }

    return (
        <>
            <FlashMessage ref={flashMessageRef} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.touchableButton} onPress={handelPingServer}>
                    <Text style={styles.touchableText}>Ping Server</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 200,
        height: 50,
    },
    touchableButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
    },
    touchableText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
});

export default PingApi;