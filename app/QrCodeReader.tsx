import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View, Vibration} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Loader from "@/components/Loader";
import Feather from "@expo/vector-icons/Feather";
import {useRouter} from 'expo-router';
import Spacer from "@/components/Spacer";
import {Checkpoint} from '@/interfaces/common';
import {getCheckpoints} from "@/functions/api/Get";
import {useToken} from "@/components/login/LoginContext";

interface IResult {
    numberOfCheckpoints: number;
    name: string;
    createdAt?: Date;
}
export default function QrCodeReader() {
    const router = useRouter();
    const [facing, setFacing] = useState<CameraType>('back');
    const [qrResult, setQrResult] = useState<string | null>(null);
    const [resultInfo, setResultInfo] = useState<IResult | null>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraIsVisible, setCameraIsVisible] = useState<boolean>(false);
    const {token, signInApp} = useToken();

    useEffect(() => {
        (async () => {
            if (qrResult) {
                const jsonObj = JSON.parse(qrResult);
                type Markers = {
                    checkpoints: Checkpoint[];
                }
                if (!token) await signInApp();
                const markers = await getCheckpoints<Markers>(jsonObj.routeId, token as string);

                const result: IResult = {
                    numberOfCheckpoints: jsonObj.numberOfCheckpoints,
                    name: jsonObj.name,
                };

                if (result.numberOfCheckpoints > 0) {
                    result.createdAt =  markers.checkpoints[0].created_at;
                }
                setResultInfo(result);
            }
        })();
    }, [qrResult]);

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
        Vibration.vibrate([1000]);
        handleToggleCamera();
    }

    const backToMaps = () => {
        if (qrResult) {
            const jsonObj = JSON.parse(qrResult);
            router.replace({ pathname: './maps', params: { routeId: jsonObj.id } });
            return;
        }
        router.replace({ pathname: './maps' });
    }

    const handleToggleCamera = () => {
        setCameraIsVisible(!cameraIsVisible);
    }

    return (
        <View style={styles.container}>
            {cameraIsVisible ? <CameraView
                style={styles.camera}
                facing={facing}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleScanResult}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <MaterialIcons name="flip-camera-android" size={24} color="white"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleToggleCamera}>
                        <Feather name="camera-off" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </CameraView> :
                <View style={{ alignItems: 'center',}}>
                    {resultInfo &&
                        <View>
                            <Text>{resultInfo.name}</Text>
                            <Text>Number of checkpoints: {resultInfo.numberOfCheckpoints}</Text>
                            <Text>Created at: {resultInfo.createdAt?.toLocaleString() && ''}</Text>
                            <TouchableOpacity style={styles.touchableButton} onPress={backToMaps}>
                                <Text style={styles.touchableText}>Start Game</Text>
                            </TouchableOpacity>
                        </View>
                    }

                    <Spacer size={10} />
                    <TouchableOpacity style={styles.touchableButton} onPress={handleToggleCamera}>
                        <Text style={styles.touchableText}>Scan</Text>
                    </TouchableOpacity>
                </View>
            }
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
    touchableButton: {
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
        width: 180,
    },
    touchableText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
});