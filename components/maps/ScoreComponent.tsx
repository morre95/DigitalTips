import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

interface IScoreProps {
    visible: boolean;
    score: number;
    questionAnswered: number;
    totalQuestions: number;
}

export default function ScoreComponent({visible, score, questionAnswered, totalQuestions}: IScoreProps) {
    return visible ? (
        <View style={styles.container}>
            <Text style={styles.scoreText}>{score} correct answers of {questionAnswered}.</Text>
            <Text style={styles.scoreText2}>Total number of question {totalQuestions} and {totalQuestions-questionAnswered} left</Text>
        </View>
    ) : null;
}

const styles = StyleSheet.create({
    container: {},
    scoreText: {
        fontSize: 12,
    },
    scoreText2: {
        fontSize: 8,
    },
});