import React, { useState } from 'react';
import {View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, } from 'react-native';

import {getSearch, SearchResponse} from '@/hooks/api/Get'


interface AutocompleteProps {
    data: string[];
    onSelect: (item: SearchResponse) => void;
    onSubmit: (item: string) => void;
    placeholder?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ data, onSelect, onSubmit, placeholder = ''  }) => {
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState<SearchResponse[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange = async (text: string) => {
        setQuery(text);
        if (text.length > 2) {
            const filtered = await getSearch(text)
            if (filtered !== null)
            setFilteredData(filtered);
        } else {
            setFilteredData([]);
        }
    };

    const handleSelect = (item: SearchResponse) => {
        setQuery(item.name);
        setFilteredData([]);
        onSelect(item);
    };

    const handleOnSubmit = () => {
        setFilteredData([]);
        onSubmit(query);
    };

    const Item = (item: SearchResponse) => {
        //const maxLength = 25;
        //const truncatedName = item.name.length > maxLength ? item.name.slice(0, maxLength) + '...' : item.name;
        const truncatedName = item.name

        return (
            <TouchableOpacity onPress={() => handleSelect(item)}>
                <Text style={styles.item}>{truncatedName}</Text>
                <Text style={styles.date}>{item.date.toLocaleString()}</Text>
                <Text style={styles.city}>{item.city}</Text>
            </TouchableOpacity>
        )
    }

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
                    keyExtractor={(item) => item.routeId.toString()}
                    renderItem={({ item }) => (
                        <Item routeId={item.routeId} name={item.name} city={item.city} date={item.date}/>
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
        width: '90%',
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
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        /*textAlign: 'center'*/
    },
    date: {
        position: 'absolute',
        top: 0,
        left: 3,
        /*bottom: 0,
        right: 5,*/

        fontSize: 10,
    },
    city: {
        position: 'absolute',
        bottom: 0,
        right: 5,

        fontSize: 10,
    }
});

export default Autocomplete;