import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { PopupBase } from "@/components/popup/PopupBase";

interface PopupProps {
    isVisible: boolean;
    title: string;
    text?: string;
    isInput?: boolean;
    onOk?: (text: string) => void;
    onCancel?: () => void;
}

export default function Popup({isVisible, title, text, isInput, onOk, onCancel}: PopupProps) {
    const [isModalVisible, setIsModalVisible] = useState(isVisible);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        setIsModalVisible(isVisible)
    }, [isVisible]);

    const handleOk = () => {
        if (onOk) onOk(inputText)
        else setIsModalVisible(false)
        setInputText('')
    };

    const handleCancel = () => {
        if (onCancel) onCancel()
        else setIsModalVisible(false)
        setInputText('')
    }
    return (
        <PopupBase isVisible={isModalVisible}>
            <PopupBase.Container>
                <View style={[styles.popup]}>
                    <PopupBase.Header title={title} />
                    <PopupBase.Body>
                        <Text style={styles.text}>
                            {text}
                        </Text>
                        {isInput && <TextInput
                            style={styles.input}
                            placeholder="message"
                            value={inputText}
                            onChangeText={setInputText}
                        />}
                    </PopupBase.Body>
                    <PopupBase.Footer>
                        <PopupBase.OkCancelButtons
                            onCancel={handleCancel}
                            onOk={handleOk}
                        />
                    </PopupBase.Footer>
                </View>
            </PopupBase.Container>
        </PopupBase>
    )
}

const styles = StyleSheet.create({
    popup: {
        backgroundColor: "#ffffff",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#000",
        borderStyle: "solid",
        width: '90%',
    },
    text: {
        fontSize: 16,
        fontWeight: "400",
        textAlign: "center",
    },
    input: {
        paddingTop: 10,
        borderColor: "grey",
        borderBottomWidth: 2,
        flex: 1,
    },
});