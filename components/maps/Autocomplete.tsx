import React, { useState } from 'react';
import {View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, } from 'react-native';

import {getSearch, SearchResponse} from '@/hooks/api/Get'

import Tooltip, {Position} from "@/components/Tooltip";

import EvilIcons from '@expo/vector-icons/EvilIcons';



interface IAutocompleteProps {
    onSelect: (item: SearchResponse) => void;
    onSubmit: (item: string) => void;
    placeholder?: string;
}

const Autocomplete: React.FC<IAutocompleteProps> = ({ onSelect, onSubmit, placeholder = ''  }) => {
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
        if (item.isPrivate) return null;
        return (
            <TouchableOpacity key={item.routeId} onPress={() => handleSelect(item)}>

                <View style={[styles.item, styles.row]}>
                    <Text style={{maxWidth: '96%'}}>{item.name} </Text>
                    <View style={{flex: 1, alignItems: 'flex-end', marginRight: 3}}>
                        <Tooltip content={`${item.description}\n(With ${item.count} checkpoints)`} position={Position.Left}>
                            <EvilIcons name="question" size={24} color="black" />
                        </Tooltip>
                    </View>
                </View>
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
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.routeId.toString()}
                renderItem={({ item }) => (
                    <Item
                        description={item.description}
                        count={item.count}
                        routeId={item.routeId}
                        name={item.name}
                        city={item.city}
                        date={item.date}
                        inOrder={item.inOrder}
                        isPrivate={item.isPrivate}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 2,
        left: 0,
        width: '95%',
        zIndex: 1100
    },
    input: {
        height: 40,
        width: '100%',
        margin: 12,
        marginBottom: 5,
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
        flex: 1,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 5,
        paddingRight: 18,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 8,
        width: '100%',
        marginLeft: 20,
    },
    date: {
        position: 'absolute',
        top: 0,
        left: 25,
        fontSize: 10,
    },
    city: {
        position: 'absolute',
        bottom: 0,
        right: 5,

        fontSize: 10,
    },
    row: {
        flexDirection: 'row'
    }
});

export default Autocomplete;