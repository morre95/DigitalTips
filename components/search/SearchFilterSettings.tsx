import React, {useEffect, useState} from 'react';
import {View, Switch, TextInput, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface ISearchFilterSettings {
    city: string;
    onCityChange: (value: string) => void;
    maxCheckpoints: number;
    onMaxCheckpointsChange: (value: number) => void;
    minCheckpoints: number;
    onMinCheckpointsChange: (value: number) => void;
}

const SearchFilterSettings = ({city, onCityChange, maxCheckpoints, onMaxCheckpointsChange, minCheckpoints, onMinCheckpointsChange}: ISearchFilterSettings) => {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        if (maxCheckpoints > 0 && minCheckpoints >= maxCheckpoints) {
            onMaxCheckpointsChange(minCheckpoints);
        }
    }, [minCheckpoints]);

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

            <Text>Min Number of Checkpoints: {minCheckpoints}</Text>

            <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor="#49ff00"
                maximumTrackTintColor='#000000'
                value={minCheckpoints}
                onValueChange={onMinCheckpointsChange}
                step={1}
            />


            <Text>Max Number of Checkpoints: {maxCheckpoints > 0 ? maxCheckpoints : 'Infinite'}</Text>

            <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor="#49ff00"
                maximumTrackTintColor='#000000'
                value={maxCheckpoints}
                onValueChange={onMaxCheckpointsChange}
                step={1}
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