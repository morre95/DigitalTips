import React, {useState, useEffect} from "react";
import {StyleSheet, View, Modal, Text, TextInput, Button, Alert} from "react-native";
import {AnswerData, RouteData} from "@/interfaces/common";
import { ButtonsComponent } from '@/components/create_route/ButtonsComponent';
import Checkbox from "expo-checkbox";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from '@expo/vector-icons/AntDesign';
import {Picker} from "@react-native-picker/picker";


interface IQuestionProps {
    visible: boolean;
    onSave: (question: string, answers: AnswerData[], order: number) => void;
    onCancel: () => void;
    currentCheckpoint: RouteData | null;
    numberOfCheckpoints: number;
    onDelete: () => void;
    onAddQuestionFromDb: () => void
}

export default function AddQuestion({visible, onSave, onCancel, currentCheckpoint, numberOfCheckpoints, onDelete, onAddQuestionFromDb}: IQuestionProps) {
    const [questionText, setQuestionText] = useState('');
    const [currentAnswers, setCurrentAnswers] = useState<AnswerData[]>([]);
    const [order, setOrder] = useState<number>(0);

    useEffect(() => {
        if (currentCheckpoint) {
            setQuestionText(currentCheckpoint.question ? currentCheckpoint.question : '')
            setCurrentAnswers(currentCheckpoint.answers ? currentCheckpoint.answers : [])
        }
    }, [currentCheckpoint]);

    useEffect(() => {
        setOrder(numberOfCheckpoints)
    }, [numberOfCheckpoints]);

    const saveQuestion = () => {
        if (questionText === '') {
            Alert.alert('There is no question')
            return
        }

        const isRightCount = currentAnswers.filter((ans) => ans.isRight).length;

        if (isRightCount <= 0) {
            Alert.alert('You need to tick at least one answer to be the right one')
            return
        }

        onSave(questionText, currentAnswers, order)
        setQuestionText('')
        setCurrentAnswers([])
    }

    const cancelQuestion = () => {
        setQuestionText('')
        setCurrentAnswers([])
        onCancel()
    }

    const addAnswerField = () => {
        setCurrentAnswers([...currentAnswers, { id: Date.now(), text: '', isRight: false }]);
    };

    const removeAnswerField = (index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers.splice(index, 1);
        setCurrentAnswers(updatedAnswers);
    };

    const handleTextChange = (text: string, index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index].text = text;
        setCurrentAnswers(updatedAnswers);
    };

    const handleCheckBoxChange = (value: boolean, index: number) => {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[index].isRight = value;
        setCurrentAnswers(updatedAnswers);
    };

    const handleOrderChanged = (order: number) => {
        setOrder(order)
    }

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            onRequestClose={() => {}}
        >
            <View style={styles.overlay}>
                <View style={styles.centeredView}>
                    <View style={styles.topMenu}>
                        <MaterialCommunityIcons.Button
                            name="database-plus"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={() => {
                                onAddQuestionFromDb()
                            }}
                        />
                        <AntDesign.Button
                            name="delete"
                            size={24}
                            color="black"
                            backgroundColor="rgba(52, 52, 52, 0)"
                            onPress={() => onDelete()}
                        />
                        <Picker
                            selectedValue={currentCheckpoint?.marker.markerOrder}
                            onValueChange={(itemValue) => {
                                handleOrderChanged(itemValue)
                            }}
                            style={{ width: 100, height: 50, marginTop: -18 }}
                            mode={'dropdown'}
                        >
                            {
                                Array.from({length: numberOfCheckpoints}, (_, i) => i + 1).map((order, index) => (
                                    <Picker.Item key={index} label={order.toString()} value={order} />
                                ))
                            }

                        </Picker>
                    </View>
                    <Text style={styles.modalText}>Add question for checkpoint!</Text>
                    <TextInput
                        style={styles.questionInput}
                        value={questionText}
                        onChangeText={(text: string) => setQuestionText(text)}
                        placeholder="Enter question"
                        onSubmitEditing={addAnswerField}
                    />
                    <MaterialIcons.Button
                        name="question-answer"
                        size={24}
                        color="black"
                        backgroundColor="rgba(52, 52, 52, 0)"
                        onPress={addAnswerField}
                    />
                    {currentAnswers.map((field, index) => (
                        <View key={field.id} style={styles.fieldRow}>
                            <TextInput
                                style={styles.textInput}
                                placeholder={`Answer #${index + 1}`}
                                value={field.text}
                                onChangeText={(text) => handleTextChange(text, index)}
                                onSubmitEditing={addAnswerField}
                                autoFocus={currentAnswers.length === index + 1}
                            />
                            <Checkbox
                                value={field.isRight}
                                onValueChange={(newVal) => handleCheckBoxChange(newVal, index)}
                            />
                            <Button
                                title="Remove"
                                onPress={() => removeAnswerField(index)}
                            />
                        </View>
                    ))}
                    <ButtonsComponent.CancelAndSaveButtons
                        onSave={saveQuestion}
                        onCancel={cancelQuestion}
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
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
    topMenu: {
        flexDirection: 'row',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    textInput: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        marginRight: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    questionInput: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        width: 250,
    },
    row: {
        flexDirection: 'row',
    },
});