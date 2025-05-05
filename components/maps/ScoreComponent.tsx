import React, {useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';

interface IScoreProps {
    visible: boolean;
    routeId: number;
    score: number;
    questionAnswered: number;
    totalQuestions: number;
}

export default function ScoreComponent({visible, routeId, score, questionAnswered, totalQuestions}: IScoreProps) {
    useEffect(() => {
        if (routeId > -1) {
            // Denna anropas två gånger när en fråga har svarats. Det beror på att både score, questionAnswered är states
            // Man skulle kunna ta bort score ur dependency arrayen.
            // Men då blir det fel så fort man ändra något i MapComponent
            console.log('ScoreComponent: score:', score, 'questionAnswered:', questionAnswered, 'totalQuestions:', totalQuestions);
        }
    }, [routeId, score, questionAnswered, totalQuestions]);
    return visible ? (
        <View style={styles.container}>
            <Text style={styles.scoreText}>{score} correct answers of {questionAnswered}.</Text>
            <Text style={styles.scoreText2}>Total number of question {totalQuestions} and {totalQuestions-questionAnswered} left to be answered</Text>
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