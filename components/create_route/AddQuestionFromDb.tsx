import React, { useState, useEffect } from 'react';
import {View, FlatList, Text, TouchableOpacity, StyleSheet, Button, ScrollView} from 'react-native';

import {Picker} from '@react-native-picker/picker';

import questionsRaw from '@/assets/triviaDB/questions.json';


type Questions = Question[]

interface Question {
    type: string
    difficulty: string
    category: string
    question: string
    correct_answer: string
    incorrect_answers: string[]
}


interface AddQuestionProps {
    onSelectedQuestion: (question: Question) => void;
    returnRandomQuestion: boolean;
}

const decodeHtmlEntity = function(str: string) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
};

const AddQuestionFromDb: React.FC<AddQuestionProps> = ({onSelectedQuestion, returnRandomQuestion}) => {
    const getRandomElement = (arr: Question[]) => arr[Math.floor(Math.random() * arr.length)]

    if (returnRandomQuestion) {
        onSelectedQuestion(getRandomElement(questionsRaw as Questions))
        return (
            <Text>Random</Text>
        )
    }

    const [questions, setQuestions] = useState<Questions>([] as Question[]);
    const [filteredQuestions, setFilteredQuestions] = useState<Questions>();

    const [selectedType, setSelectedType] = useState<string>('multiple');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');
    const [selectedCategory, setSelectedCategory] = useState<string>('History');

    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const newQuestions: Question[] = questionsRaw as Questions;
        setQuestions(newQuestions)
        setCategories(Array.from(new Set(newQuestions.map(q => q.category))));
    }, []);

    const filterAndSortQuestions = (type: string, difficulty: string, category: string) => {
        return questions
            .filter(question =>
                (type ? question.type === type : true) &&
                (difficulty ? question.difficulty === difficulty : true) &&
                (category ? question.category === category : true)
            )
            .sort((a, b) => a.question.localeCompare(b.question)); // Sortera alfabetiskt efter fråga
    };

    const handleFilter = () => {
        const result = filterAndSortQuestions(selectedType, selectedDifficulty, selectedCategory);
        setFilteredQuestions(result);
    };

    return (
        <View style={styles.container}>
            <Button title="Filtrera Frågor" onPress={handleFilter} />

            <Picker
                selectedValue={selectedType}
                onValueChange={(itemValue, itemIndex) =>
                    setSelectedType(itemValue)
                }
                mode={'dropdown'}
            >
                <Picker.Item label="Multiple Choice" value="multiple" />
                <Picker.Item label="True / False" value="boolean" />
            </Picker>

            <Picker
                selectedValue={selectedDifficulty}
                onValueChange={(itemValue, itemIndex) =>
                    setSelectedDifficulty(itemValue)
                }
                mode={'dropdown'}
            >
                <Picker.Item label="Easy" value="easy" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Hard" value="hard" />
            </Picker>

            <Picker
                selectedValue={selectedDifficulty}
                onValueChange={(itemValue, itemIndex) =>
                    setSelectedCategory(itemValue)
                }>
                {
                    categories.map((category, index) => (
                        <Picker.Item key={index} label={category} value={category} />
                    ))
                }
            </Picker>
            <FlatList
                data={filteredQuestions}
                keyExtractor={(item) => item.question}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => onSelectedQuestion(item)}>
                        <View style={styles.question}>
                            <Text>{decodeHtmlEntity(item.question)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
    },
    question: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 4,
        padding: 10,
    }
})

export default AddQuestionFromDb;