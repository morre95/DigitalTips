import React, {useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import RefPopup from "@/components/popup/RefPopup";
import FinishPopup from "@/components/popup/FinishPopup";
import {getPlayerId} from "@/functions/common";
import {postJsonWithToken} from "@/functions/api/Post";
import {useToken} from "@/components/login/LoginContext";

interface SendData {
    route_id: number;
    user_id: number;
    correct: number;
    incorrect: number;
    not_answered: number;
}

interface IScoreProps {
    visible: boolean;
    routeId: number;
    score: number;
    questionAnswered: number;
    totalQuestions: number;
}

export default function ScoreComponent({visible, routeId, score, questionAnswered, totalQuestions}: IScoreProps) {
    const {token} = useToken();
    useEffect(() => {
        (async () => {
            if (routeId > -1 && questionAnswered === totalQuestions) {
                const userId = await getPlayerId();
                const sendData : SendData = {
                    route_id: routeId,
                    user_id: userId,
                    correct: score,
                    incorrect: totalQuestions - score,
                    not_answered: totalQuestions - questionAnswered,
                };

                await postJsonWithToken<SendData, {error: boolean, message: string}>(
                    '/api/add/result',
                    sendData,
                    token as string
                );


                FinishPopup.show(
                    'Finished...',
                    `Congratulations!!! You have finished the route with score: ${score}/${totalQuestions}`
                );
            }
        })()

    }, [questionAnswered, totalQuestions]);

    return visible ? (
        <View style={styles.container}>
            <Text style={styles.scoreText}>{score} correct answers of {questionAnswered}.</Text>
            <Text style={styles.scoreText2}>Total number of question {totalQuestions} and {totalQuestions-questionAnswered} left to be answered</Text>
            <RefPopup
                onClose={() => {
                    FinishPopup.hide();
                }}
            />
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