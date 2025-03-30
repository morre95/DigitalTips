import {Modal, Text, View, TouchableOpacity, StyleSheet} from "react-native";
import React from "react";
import {QR_codeIcon} from "@/assets/images";
import QRCode from "react-native-qrcode-svg";
import Spacer from "@/components/Spacer";


interface QRCodeModalProps {
    name: string;
    routeId: number;
    visible: boolean;
    close: () => void;
    open: () => void;
}

const QrCodeModal = ({name, routeId, visible, close, open}: QRCodeModalProps)  => {
    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <QRCode
                            value={JSON.stringify({name: name, routeId: routeId})}
                            size={180}
                            logo={{uri: QR_codeIcon}}
                            logoSize={40}
                            logoBackgroundColor='transparent'
                            logoBorderRadius={5}
                        />
                        <Spacer size={20}/>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => close()}>
                            <Text style={styles.textStyle}>Hide</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                style={[styles.button, styles.buttonOpen]}
                onPress={() => open()}>
                <Text style={styles.textStyle}>Show QR code</Text>
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
});

export default QrCodeModal;