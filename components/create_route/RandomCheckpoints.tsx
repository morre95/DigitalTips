import React, {useState} from 'react';

import {View, Modal, Text, TextInput, StyleSheet, Button, Alert} from 'react-native'
import {Picker} from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

import { getDistance } from 'geolib';

import {randomCoordinate, Coordinate} from '@/functions/coordinates'

import {MarkerData, AnswerData, RouteData} from '@/interfaces/common'
import { getCity } from "@/functions/request";

type Questions = Question[]
interface Question {
    type: string
    difficulty: string
    category: string
    question: string
    correct_answer: string
    incorrect_answers: string[]
}

interface iProps {
    isVisible: boolean;
    onFinish: (route: RouteData[]) => void;
    currentCoordinate: Coordinate;
}

const range = (start: number, end: number): number[] => {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}

const getKmRange = (input: string): number => {
    const floatRegex = /[-+]?[0-9]*\.?[0-9]+/g;
    const matches = input.match(floatRegex);
    if (matches) {
        return Number(matches[0])
    } else {
        return -1
    }
}

const isFloat = (value: string): boolean => {
    return /^[-+]?(?:\d+(\.\d+)?|\.\d+|\d+\.?|\.)$/.test(value);
};

const getRandomQuestion = (arr: Question[]) => arr[Math.floor(Math.random() * arr.length)]

const RandomCheckPoints: React.FC<iProps> = ({ isVisible, onFinish, currentCoordinate }) => {
    const [numberOfCheckpoints, setNumberOfCheckpoints] = useState<number>(3);
    const [isRandomQuestionChecked, setIsRandomQuestionChecked] = useState<boolean>(true);
    const [rangeKm, setRangeKm] = useState<string>('2');

    const handleOnTextChange = (text: string) => {
        if (text.length > 0 && !isFloat(text)) {
            setRangeKm(text.slice(0,-1))
        } else {
            setRangeKm(text)
        }
    }

    const handleOnFinnish = async () => {
        const questionsRaw = require('@/assets/triviaDB/questions.json');
        const questions: Question[] = questionsRaw as Questions;
        const checkpoints: RouteData[] = []

        const minDistance = 100;
        const maxRangeKM = getKmRange(rangeKm);
        // TBD: skriptet bör inte kunna ta sig hit, man kan vara bra för hängslen och livrem
        if (maxRangeKM < 0) {
            Alert.alert('You need to give me a number')
            return
        }

        if ((maxRangeKM * 1000) - 20 <= minDistance) {
            Alert.alert(`You have set the radius bigger then ${minDistance + 20} meter`)
            return
        }

        let city: string = ''

        while (checkpoints.length < numberOfCheckpoints) {
            const coordinate = randomCoordinate(currentCoordinate, maxRangeKM);

            let tooClose = false;
            for (const checkpoint of checkpoints) {
                const distance = getDistance(coordinate, checkpoint.marker);
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose) {
                const question = getRandomQuestion(questions);

                const answers: AnswerData[] = []
                let newAnswers: AnswerData = {
                    id: answers.length + 1,
                    text: question.correct_answer,
                    isRight: true,
                }
                answers.push(newAnswers)
                for (let incorrect of question.incorrect_answers) {
                    newAnswers = {
                        id: answers.length + 1,
                        text: incorrect,
                        isRight: false,
                    }
                    answers.push(newAnswers)
                }

                const len = checkpoints.length

                if (city === '') {
                    const result = await getCity({latitude: coordinate.latitude, longitude: coordinate.longitude})
                    if (result) {
                        city = result
                    }
                }

                const marker: MarkerData = {
                    id: len + 1, //++markersCount,
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                    name: `Marker ${len + 1}`,
                    markerOrder: len + 1,
                    city: city
                }

                const checkpoint: RouteData = {
                    marker: marker,
                    question: question.question,
                    answers: answers,
                }

                checkpoints.push(checkpoint)
            }
        }

        onFinish(checkpoints)
    }

    return (
        <Modal
            visible={isVisible}
            animationType={"slide"}
            transparent={true}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
            }}
        >
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <View style={styles.section}>
                        <Checkbox
                            style={styles.checkbox}
                            value={isRandomQuestionChecked}
                            onValueChange={setIsRandomQuestionChecked}
                            color={isRandomQuestionChecked ? '#0000ff' : undefined}
                            disabled={true} // TBD: bör tas bort när denna implementeras
                        />
                        <Text style={styles.paragraph}> Generate random questions</Text>
                    </View>
                    <View style={styles.section}>
                        <Picker
                            style={{width: 100, height: 50}}
                            selectedValue={numberOfCheckpoints}
                            onValueChange={(itemValue) =>
                                setNumberOfCheckpoints(itemValue)
                            }
                        >
                            {
                                range(1, 26).map((item, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={item.toString()}
                                        value={item}
                                    />
                                ))
                            }
                        </Picker>
                        <Text style={styles.paragraph}> Number of checkpoints</Text>
                    </View>
                    <View style={styles.section}>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleOnTextChange}
                            value={rangeKm}
                            keyboardType={"numeric"}
                        />
                        <Text style={styles.paragraph}> The radius in km</Text>
                    </View>
                    <View style={[styles.section, { justifyContent: 'flex-end', marginTop: 10, marginBottom: 5 }]}>
                        <Button
                            title={'Generate'}
                            onPress={handleOnFinnish}

                        />
                        <View style={{marginRight: 20}}></View>
                        <Button
                            title={'Cancel'}
                            onPress={() => {onFinish([])}}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
    },
    input: {
        width: 40,
        height: 40,
        borderRadius: 5,
        borderStyle: 'solid',
        borderWidth: 1,
    },
    picker: {

    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paragraph: {
        fontSize: 15,
    },
    checkbox: {
        margin: 8,
    },
})

export default RandomCheckPoints;