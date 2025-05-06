import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity, Pressable} from 'react-native';
import {useToken} from "@/components/login/LoginContext";
import {getMyResults} from "@/functions/api/Get";
import {getPlayerId} from "@/functions/common";

const Row = ({column}: {column: string[]}) => {
    return (
        <View style={styles.rowStyle}>
            {column.map((data, index) => (
                <Cell key={index.toString()} data={data} />
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

const Header = ({column}: {column: string[]}) => {
    return (
        <View style={styles.headerStyle}>
            {column.map((data, index) => (
                <HeaderCell key={index.toString()} data={data} />
            ))}
        </View>
    );
};

const HeaderCell = ({data}: {data: string}) => {
    return (
        <View style={styles.headerCellStyle}>
            <Text style={styles.headerTextStyle}>{data}</Text>
        </View>
    );
};

const ShowResult = () => {
    const [showResult, setShowResult] = useState(false);
    const {token} = useToken();
    let dataRef = useRef<string[][]>([]).current;

    const setData = async () => {
        const userId = await getPlayerId();
        const result = await getMyResults(userId, token as string);
        if (result) {
            // Ingen snygg lösning men eftersom dataRef = [] inte funkade så...;
            while(dataRef.length){
                dataRef.pop();
            }
            for (const item of result) {
                dataRef.push([
                    item.name,
                    item.correct.toString(),
                    item.incorrect.toString(),
                    item.notAnswered.toString()
                ]);
            }

            setShowResult(true);
        }
    }

    const handleClose = () => {
        dataRef = [];
        setShowResult(false);
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
                <Pressable style={styles.centeredView} onPress={handleClose}>
                    <View style={styles.gridContainer}>
                        <Header column={['Name', 'Correct', 'Incorrect', 'Not Answered']} />
                        {dataRef.map((column, index) => (
                            <Row key={index.toString()} column={column} />
                        ))}
                    </View>
                </Pressable>
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
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },

    headerStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
    },
    headerCellStyle: {
        flex: 1,
        marginHorizontal: 10,
    },
    headerTextStyle: {
        fontSize: 18,
        fontWeight: 'bold'
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