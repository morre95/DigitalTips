import React, { useImperativeHandle, useRef, forwardRef, useState, useLayoutEffect } from "react";
import {PopupBase} from "./PopupBase";
import {StyleSheet, Text, View} from "react-native";
import FinishPopup from "./FinishPopup";

export type CustomModalRef = {
    show: (title?: string, message?: string) => void;
    hide: () => void;
}

interface Props {
    onClose: () => void;
}

const RefPopup = ({onClose}: Props, ref?: any) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const popupRef = useRef<CustomModalRef>();

    useLayoutEffect(() => {
        if (ref) {
            FinishPopup.setRef(ref);
        } else {
            FinishPopup.setRef(popupRef);
        }
    }, [])

    useImperativeHandle(
        popupRef,
        () => ({
            show: (title?: string, message?: string) => {
                setTitle(title || '');
                setMessage(message || 'This is a popup');
                setPopupVisible(true);
            },
            hide: () => {
                setPopupVisible(false);
            },
        }),
        []
    );

    return <PopupBase isVisible={popupVisible}>
        <PopupBase.Container>
            <View style={[styles.popup]}>
                <PopupBase.Header title={title} />
                <PopupBase.Body>
                    <Text style={styles.text}>
                        {message}
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

});

export default forwardRef(RefPopup);