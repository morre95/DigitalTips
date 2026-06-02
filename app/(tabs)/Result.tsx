import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useToken} from '@/components/login/LoginContext';
import {getPlayerId} from '@/functions/common';
import {postJsonWithToken} from '@/functions/api/Post';
import {getLeaderboard, LeaderboardEntry} from '@/functions/api/Get';
import ResultTable from '@/components/ResultTable';

interface SendData {
    route_id: number;
    user_id: number;
    correct: number;
    incorrect: number;
    not_answered: number;
}

export default function Result() {
    const {routeId, correct, incorrect, total} = useLocalSearchParams<{
        routeId: string;
        correct: string;
        incorrect: string;
        total: string;
    }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {token} = useToken();

    const routeIdNum = Number(routeId);
    const correctNum = Number(correct);
    const incorrectNum = Number(incorrect);
    const totalNum = Number(total);
    const notAnswered = Math.max(totalNum - correctNum - incorrectNum, 0);

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [playerId, setPlayerId] = useState<number>(-1);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const submitted = useRef<boolean>(false);

    useEffect(() => {
        // Guard against double submission on remount / Fast Refresh.
        if (submitted.current) return;
        submitted.current = true;

        (async () => {
            try {
                const userId = await getPlayerId();
                setPlayerId(userId);

                const sendData: SendData = {
                    route_id: routeIdNum,
                    user_id: userId,
                    correct: correctNum,
                    incorrect: incorrectNum,
                    not_answered: notAnswered,
                };
                await postJsonWithToken<SendData, {error: boolean; message: string}>(
                    '/api/add/result',
                    sendData,
                    token as string,
                );

                const board = await getLeaderboard(routeIdNum, token as string);
                setLeaderboard(board ?? []);
            } catch (e) {
                console.error('Result submit/leaderboard failed:', e);
                setErrorMsg('Could not load the leaderboard. Your result may not have been saved.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const rows = leaderboard.map((entry, index) => [
        String(index + 1),
        entry.name,
        entry.correct.toString(),
        entry.incorrect.toString(),
    ]);
    const highlightRowIndex = leaderboard.findIndex(entry => entry.userId === playerId);

    return (
        <View style={[styles.container, {paddingTop: insets.top + 16}]}>
            <Text style={styles.title}>Route complete!</Text>

            <View style={styles.summaryCard}>
                <Text style={styles.scoreBig}>{correctNum} / {totalNum}</Text>
                <Text style={styles.scoreLabel}>correct answers</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryItem}>✅ Correct: {correctNum}</Text>
                    <Text style={styles.summaryItem}>❌ Wrong: {incorrectNum}</Text>
                    {notAnswered > 0 && (
                        <Text style={styles.summaryItem}>➖ Not answered: {notAnswered}</Text>
                    )}
                </View>
            </View>

            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <ScrollView style={styles.boardScroll} contentContainerStyle={styles.boardContent}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ) : errorMsg ? (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                ) : rows.length > 0 ? (
                    <ResultTable
                        columns={['#', 'Name', 'Correct', 'Wrong']}
                        rows={rows}
                        highlightRowIndex={highlightRowIndex >= 0 ? highlightRowIndex : undefined}
                    />
                ) : (
                    <Text style={styles.emptyText}>No results yet for this route.</Text>
                )}
            </ScrollView>

            <Pressable style={styles.button} onPress={() => router.replace('./Maps')}>
                <Text style={styles.buttonText}>Back to map</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
        backgroundColor: '#f4f6f8',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    scoreBig: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#0569FF',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    summaryItem: {
        fontSize: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    boardScroll: {
        flex: 1,
    },
    boardContent: {
        paddingVertical: 8,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: '#555',
        marginTop: 16,
    },
    button: {
        alignItems: 'center',
        padding: 14,
        borderRadius: 15,
        backgroundColor: '#0569FF',
        marginTop: 16,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
});
