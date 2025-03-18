import React, {useState} from "react";
import { StyleSheet, View, Modal, Text, Pressable } from "react-native";
import {Question} from "@/interfaces/common";
import { ButtonsComponent } from '@/components/create_route/ButtonsComponent';

interface IQuestionProps {
    visible: boolean;
    onSave: (question: Question) => void;
    onCancel: () => void;
}

export default function AddQuestion({visible, onSave, onCancel}: IQuestionProps) {
    const [question, setQuestion] = useState<Question>();
    const saveQuestion = () => {
        if (question) onSave(question);
        else console.log('Det finns ingen fråga sparad')
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {}}
        >
            <View style={styles.centeredView}>
                <View style={styles.overlay}>
                    <Text style={styles.modalText}>Hello World!</Text>
                    <ButtonsComponent.CancelAndSaveButtons
                        onSave={saveQuestion}
                        onCancel={onCancel}
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
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
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});