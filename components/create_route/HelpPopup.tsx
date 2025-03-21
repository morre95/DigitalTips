import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { PopupBase } from "@/components/popup/PopupBase";

interface IProps {
    visible: boolean;
    onClose: () => void;
}
export default function HelpPopup({ visible, onClose }: IProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        setIsModalVisible(visible)
    }, [visible]);

    return (
        <PopupBase isVisible={isModalVisible}>
            <PopupBase.Container>
                <View style={[styles.popup]}>
                    <PopupBase.Header title="Help" />
                    <PopupBase.Body>
                        <Text style={styles.text}>
                            Click on the map to add checkpoints
                        </Text>
                    </PopupBase.Body>
                    <PopupBase.Footer>
                        <PopupBase.OkButton
                            onOk={onClose}
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