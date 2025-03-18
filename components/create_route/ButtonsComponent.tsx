import React, { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'white',
    },
    finishButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        paddingHorizontal: 20,
        width: '20%',
        minWidth: 100,
    },
    continueButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        paddingHorizontal: 20,
        width: '20%',
        minWidth: 100,
    },
    cancelButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        paddingHorizontal: 20,
        width: '20%',
        minWidth: 100,
    },
    text: {
        color: 'white',
        textAlign: 'center',
    },
});

interface FinishProps {
    onFinish: () => void;
    onCancel: () => void;
}
interface ContinueProps {
    onContinue: () => void;
    onCancel: () => void;
}

interface SaveProps {
    onSave: () => void;
    onCancel: () => void;
}

const CancelAndFinishButtons: FC<FinishProps> = ({ onFinish, onCancel }) => {
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.text}>{'Cancel'}</Text>
            </Pressable>
            <Pressable style={styles.finishButton} onPress={onFinish}>
                <Text style={styles.text}>{'Finish'}</Text>
            </Pressable>
        </View>
    );
};
const CancelAndContinueButtons: FC<ContinueProps> = ({ onContinue, onCancel }) => {
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.text}>{'Cancel'}</Text>
            </Pressable>
            <Pressable style={styles.continueButton} onPress={onContinue}>
                <Text style={styles.text}>{'Continue'}</Text>
            </Pressable>
        </View>
    );
};

const CancelAndSaveButtons = ({ onSave, onCancel }:SaveProps) => {
    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.text}>{'Cancel'}</Text>
            </Pressable>
            <Pressable style={styles.continueButton} onPress={onSave}>
                <Text style={styles.text}>{'Save'}</Text>
            </Pressable>
        </View>
    );
}

export const ButtonsComponent = { CancelAndFinishButtons, CancelAndContinueButtons, CancelAndSaveButtons };
