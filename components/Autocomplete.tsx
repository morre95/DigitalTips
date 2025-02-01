import React, { useState } from 'react';
import {View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, StyleProp,} from 'react-native';

interface AutocompleteProps {
    data: string[];
    onSelect: (item: string) => void;
    onSubmit: (item: string) => void;
    placeholder?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ data, onSelect, onSubmit, placeholder = ''  }) => {
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange = (text: string) => {
        setQuery(text);
        if (text) {
            const filtered = data.filter(item =>
                item.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData([]);
        }
    };

    const handleSelect = (item: string) => {
        setQuery(item);
        setFilteredData([]);
        onSelect(item);
    };

    const handleOnSubmit = () => {
        setFilteredData([]);
        onSubmit(query);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={isFocused ? styles.fokusInput : styles.input}
                value={query}
                onChangeText={handleInputChange}
                placeholder={placeholder}
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
                onSubmitEditing={handleOnSubmit}
            />
            {filteredData.length > 0 && (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelect(item)}>
                            <Text style={styles.item}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 2,
        left: 0,
        width: '80%',
    },
    input: {
        height: 40,
        width: '100%',
        margin: 12,
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
    },
    fokusInput: {
        height: 40,
        width: '100%',
        margin: 12,
        borderWidth: 2,
        borderRadius: 14,
        padding: 10,
    },
    item: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default Autocomplete;