import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar, Vibration} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Loader from "@/components/Loader";

export default function QrCodeReader() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [qrResult, setQrResult] = useState<string | null>(null);
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading.
        return (
            <View>
                <Loader loading={true} />
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>To scan qr codes for this game we need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const handleScanResult = (scanResult: BarcodeScanningResult) => {
        const { data } = scanResult;
        setQrResult(data);
        Vibration.vibrate([1000])
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleScanResult}
            >
                <View style={styles.buttonContainer}>
                    {Platform.OS === "android" ? <StatusBar hidden /> : null}
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <MaterialIcons name="flip-camera-android" size={24} color="white" />
                    </TouchableOpacity>

                </View>
            </CameraView>
            {qrResult && <Text style={{backgroundColor: '#fff'}}>{qrResult}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});