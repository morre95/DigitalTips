import React, { useState, useEffect } from 'react';
import {View, FlatList, Text, TouchableOpacity, StyleSheet, Button, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import questionsRaw from '@/assets/triviaDB/questions.json';
import Spacer from "@/components/Spacer";
import {sleep} from '@/functions/common'

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
}

const decodeHtmlEntity = function(str: string) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
};

const AddQuestionFromDb: React.FC<AddQuestionProps> = ({onSelectedQuestion}) => {
    const [questions, setQuestions] = useState<Questions>([] as Question[]);
    const [categories, setCategories] = useState<string[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Questions>();

    const [selectedType, setSelectedType] = useState<string>('multiple');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');
    const [selectedCategory, setSelectedCategory] = useState<string>('History');


    useEffect(() => {
        const newQuestions: Question[] = questionsRaw as Questions;
        setQuestions(newQuestions)
        setCategories(
            Array.from(
                new Set(
                    newQuestions.map(q => q.category)
                )
            )
        );
    }, []);

    useEffect(() => {
        filterQuestions();
    }, [questions, categories]);

    const filterAndSortQuestions = (type: string, difficulty: string, category: string) => {
        return questions
            .filter(question =>
                (type ? question.type === type : true) &&
                (difficulty ? question.difficulty === difficulty : true) &&
                (category ? question.category === category : true)
            )
            .sort((a, b) => a.question.localeCompare(b.question)); // Sortera alfabetiskt efter fråga
    };

    const filterQuestions = () => {
        const result = filterAndSortQuestions(selectedType, selectedDifficulty, selectedCategory);
        setFilteredQuestions(result);
    };

    useEffect(() => {
        filterQuestions();
    }, [selectedType, selectedDifficulty, selectedCategory]);

    const handleRandom = () => {
        const result = filterAndSortQuestions(selectedType, selectedDifficulty, selectedCategory);
        if (result.length > 0) {
            const random = Math.floor(Math.random() * result.length);
            onSelectedQuestion(result[random])
        } else {
            Alert.alert('No results', 'The filter parameters give no results, change them and try again.')
        }
    }

    return (
        <View style={styles.container}>
            <Button title="Generate a random question" onPress={handleRandom} />
            <Spacer size={20} />
            <Text>Type:</Text>
            <Picker
                selectedValue={selectedType}
                onValueChange={(itemValue) =>
                    setSelectedType(itemValue)
                }
                mode={'dropdown'}
            >
                <Picker.Item label="Multiple Choice" value="multiple" />
                <Picker.Item label="True / False" value="boolean" />
            </Picker>
            <Text>Difficulty:</Text>
            <Picker
                selectedValue={selectedDifficulty}
                onValueChange={(itemValue) =>
                    setSelectedDifficulty(itemValue)
                }
                mode={'dropdown'}
            >
                <Picker.Item label="Easy" value="easy" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Hard" value="hard" />
            </Picker>
            <Text>Category:</Text>
            <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) =>
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