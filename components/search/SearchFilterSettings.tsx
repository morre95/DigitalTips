import React, {useState} from 'react';
import {View, Switch, TextInput, StyleSheet } from 'react-native';

interface ISearchFilterSettings {
    city: string;
    onCityChange: (value: string) => void;
}

const SearchFilterSettings = ({city, onCityChange}: ISearchFilterSettings) => {
    const [isEnabled, setIsEnabled] = useState(false);


    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
            />

            <TextInput
                style={styles.input}
                value={city}
                onChangeText={onCityChange}
                placeholder="City"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#8a8a8a',
        width: '95%',
        padding: 10,
        margin: 10,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        backgroundColor: '#f5dd4b',
    },
});


export default SearchFilterSettings;