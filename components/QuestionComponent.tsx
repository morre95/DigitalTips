import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import {Question} from '@/interfaces/common';

interface Props {
    question: Question;
    onAnswerSelected: (isCorrect: boolean) => void;
}

const QuestionComponent: React.FC<Props> = ({ question, onAnswerSelected }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.questionText}>{question.text}</Text>
            {question.answers.map((answer, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.answerButton}
                    onPress={() => onAnswerSelected(answer.isCorrect)}
                >
                    <Text style={styles.answerText}>{answer.isCorrect ? `*${answer.text}` : answer.text}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    questionText: {
        fontSize: 18,
        marginBottom: 10,
    },
    answerButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        cursor: 'pointer',
    },
    answerText: {
        fontSize: 16,
        color: '#0000ff',

    },
});

export default QuestionComponent;
