import React, {useState, useRef, ComponentRef} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity, Pressable} from 'react-native';
import {useToken} from "@/components/login/LoginContext";
import {getMyResults} from "@/functions/api/Get";
import {getPlayerId} from "@/functions/common";
import FlashMessage from "@/components/FlashMessage";
import ResultTable from "@/components/ResultTable";

const ShowResult = () => {
    const [showResult, setShowResult] = useState(false);
    const {token} = useToken();
    let dataRef = useRef<string[][]>([]).current;
    const flashMessageRef = useRef<ComponentRef<typeof FlashMessage>>(null);

    const setData = async () => {
        const userId = await getPlayerId();
        const result = await getMyResults(userId, token as string);
        if (result && result.length > 0) {
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
        } else if(flashMessageRef.current) {
            flashMessageRef.current.warning( 'There are no result to show', 2000);
        }
    }

    const handleClose = () => {
        dataRef = [];
        setShowResult(false);
    }

    return (
        <>
            <FlashMessage ref={flashMessageRef} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={showResult}
                onRequestClose={() => {
                    setShowResult(!showResult);
                }}>
                <Pressable style={styles.centeredView} onPress={handleClose}>
                    <ResultTable columns={['Name', 'Correct', 'Incorrect', 'Not Answered']} rows={dataRef} />
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
