import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import {useToken} from "@/components/login/LoginContext";
import {getMyResults} from "@/functions/api/Get";
import {getPlayerId} from "@/functions/common";

const Row = ({columns}: {columns: string[]}) => {
    return (
        <View style={styles.rowStyle}>
            {columns.map((data) => (
                <Cell data={data} />
            ))}
        </View>
    );
};

const Cell = ({data}: {data: string}) => {
    return (
        <View style={styles.cellStyle}>
            <Text>{data}</Text>
        </View>
    );
};

const ShowResult = () => {
    const [showResult, setShowResult] = useState(false);
    const {token} = useToken();
    let dataRef = useRef<string[]>([]).current;

    const setData = async () => {
        const userId = await getPlayerId();
        const result = await getMyResults(userId, token as string);
        if (result) {
            for (const item of result) {
                dataRef.push(item.name);
                dataRef.push(item.correct.toString());
                dataRef.push(item.incorrect.toString());
                dataRef.push(item.notAnswered.toString());
            }

            setShowResult(true);
        }
    }

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showResult}
                onRequestClose={() => {
                    setShowResult(!showResult);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.gridContainer}>
                        <Row columns={dataRef} />
                    </View>
                </View>
            </Modal>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.touchableButton} onPress={setData}>
                    <Text style={styles.touchableText}>Show your Results</Text>
                </TouchableOpacity>
            </View>
        </>

    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
    },
    gridContainer: {
        width: 220,
    },
    rowStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    cellStyle: {
        flex: 1,
        margin: 10,
    },
    buttonContainer: {
        width: 200,
        height: 50,
    },
    touchableButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#0569FF',
        borderColor: '#0569FF',
    },
    touchableText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ShowResult;