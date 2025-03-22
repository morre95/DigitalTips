import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { PopupBase } from "@/components/popup/PopupBase";
import Spacer from "@/components/Spacer";
import {getPlayerName} from "@/functions/common";


interface IProps {
    visible: boolean;
    onSelect: (playerName: string) => void;
    onCancel: () => void;
}

export default function PlayerNameSelect({visible, onSelect, onCancel}: IProps) {
    const [selectedPlayerName, setSelectedPlayerName] = useState("");

    useEffect(() => {
        (async () => {
            const playerName = await getPlayerName()
            if (playerName) setSelectedPlayerName(playerName)
        })()
    }, []);

    const handleOk = () => {
        onSelect(selectedPlayerName);
    }

    const handleCancel = () => {
        onCancel();
    }
    return (
        <PopupBase isVisible={visible}>
            <PopupBase.Container>
                <View style={[styles.popup]}>
                    <PopupBase.Header title={'Select a name'} />
                    <PopupBase.Body>
                        <Text style={styles.text}>
                            If you never haven't selected a name yet and hit cancel your player name is going to be "Player 1".
                        </Text>
                        <Spacer size={20} />
                        <Text style={styles.text}>
                            You can always change this later under settings.
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Put your player name here..."
                            value={selectedPlayerName}
                            onChangeText={test => setSelectedPlayerName(test)}
                        />
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
    text: {
        fontSize: 16,
        fontWeight: "400",
    },
    input: {
        paddingTop: 10,
        borderColor: "grey",
        borderBottomWidth: 2,
    },
});