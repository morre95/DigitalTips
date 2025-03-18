import React, {useEffect, useState} from "react";
import {StyleSheet, View, Text, Modal, TouchableOpacity} from "react-native";

import { OkCancelButtons } from "@/interfaces/OkCancelButtons";
import { PopupBaseProps } from '@/interfaces/PopupBaseProps';

export const PopupBase = ({isVisible, children}: PopupBaseProps) => {
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        setModalVisible(isVisible)
    }, [isVisible]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            {children}
        </Modal>
    )
}

const PopupContainer = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.container}>{children}</View>
);

const PopupHeader = ({ title }: { title: string }) => (
    <View style={styles.header}>
        <Text style={styles.text}>{title}</Text>
    </View>
);

const PopupBody = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.body}>{children}</View>
);

const PopupFooter = ({ children }: { children?: React.ReactNode }) => (
    <View style={styles.footer}>{children}</View>
);

const PopupOkCancelButtons = ({onOk, onCancel, okText, cancelText}: OkCancelButtons) => (
    <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={onOk}>
            <Text style={styles.buttonText}>{okText ? okText : 'OK'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: 'orange'}]} onPress={onCancel}>
            <Text style={styles.buttonText}>{cancelText ? cancelText : 'Cancel'}</Text>
        </TouchableOpacity>
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    header: {
    },
    text: {
        paddingTop: 10,
        textAlign: "center",
        fontSize: 24,
    },
    body: {
        paddingHorizontal: 15,
        minHeight: 70,
    },
    footer: {
        padding: 10,
        flexDirection: "row",
    },
    buttons: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    button: {
        backgroundColor: "blue",
        marginTop: 15,
        paddingVertical: 15,
        borderRadius: 25,
        width: 150,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 18,
    },
});

PopupBase.Header = PopupHeader;
PopupBase.Container = PopupContainer;
PopupBase.Body = PopupBody;
PopupBase.Footer = PopupFooter;
PopupBase.OkCancelButtons = PopupOkCancelButtons;