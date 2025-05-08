import {Modal, Text, View, TouchableOpacity, StyleSheet, Alert, StyleProp, ViewStyle, TextStyle} from "react-native";
import React, {useRef} from "react";
import * as Sharing from 'expo-sharing';
import ViewShot, { captureRef } from "react-native-view-shot";
import {QR_codeIcon} from "@/assets/images";
import QRCode from "react-native-qrcode-svg";
import Spacer from "@/components/Spacer";

interface QRCodeModalProps {
    name: string;
    routeId: number;
    visible: boolean;
    close: () => void;
    open: () => void;
    showButtonStyle?: StyleProp<ViewStyle>;
    showButtonTextStyle?: StyleProp<TextStyle>;
}

const checkSharingAvailability = async (): Promise<boolean> => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        Alert.alert('Sharing Not Available', 'Sharing is not supported on this device.');
    }
    return isAvailable;
};

const QrCodeModal = ({name, routeId, visible, close, open, showButtonStyle, showButtonTextStyle}: QRCodeModalProps)  => {
    const qrRef = useRef<ViewShot | null>(null);

    const handleShareOnPress = async () => {
        if (await checkSharingAvailability() && qrRef.current) {
            const fileUri = await captureRef(qrRef.current, {
                format: 'png',
                quality: 1,
            });
            await Sharing.shareAsync(
                fileUri,
                {
                    dialogTitle: 'Share ' + name,
                    mimeType: 'image/png',
                }
            );

            close();
        } else {
            console.error('Maybe svg ref is corrupt:', qrRef);
        }
    };


    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
            >
                <TouchableOpacity
                    style={styles.centeredView}
                    onPress={() => close()}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.qrCodeText}>{name}</Text>
                        <ViewShot ref={qrRef}>
                            <QRCode
                                value={JSON.stringify({name: name, routeId: routeId})}
                                size={220}
                                logo={{uri: QR_codeIcon}}
                                logoSize={40}
                                logoBackgroundColor='transparent'
                                logoBorderRadius={5}
                                enableLinearGradient={true}
                            />
                        </ViewShot>
                        <Spacer size={20}/>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={handleShareOnPress}
                        >
                            <Text style={styles.textStyle}>Share</Text>
                        </TouchableOpacity>

                    </View>
                </TouchableOpacity>
            </Modal>
            <TouchableOpacity
                style={[styles.button, styles.buttonOpen, showButtonStyle]}
                onPress={() => open()}
            >
                <Text style={[styles.textStyle, showButtonTextStyle]}>Show & Share QR code</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
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
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        minWidth: 150,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    qrCodeText: {
        marginBottom: 10,
        fontSize: 18,
        fontStyle: 'italic',
        borderBottomWidth: 1,
        borderColor: '#000000',
    },
});

export default QrCodeModal;