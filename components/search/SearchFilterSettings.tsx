import React, {useEffect} from 'react';
import {View, Switch, TextInput, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface ISearchFilterSettings {
    city: string;
    onCityChange: (value: string) => void;
    maxCheckpoints: number;
    onMaxCheckpointsChange: (value: number) => void;
    minCheckpoints: number;
    onMinCheckpointsChange: (value: number) => void;
    isPrivate: boolean;
    onIsPrivateChange: (value: boolean) => void;
    inOrder: boolean;
    onInOrderChange: (value: boolean) => void;
}

const SearchFilterSettings = ({
    city,
    onCityChange,
    maxCheckpoints,
    onMaxCheckpointsChange,
    minCheckpoints,
    onMinCheckpointsChange,
    isPrivate,
    onIsPrivateChange,
    inOrder,
    onInOrderChange,
}: ISearchFilterSettings) => {

    useEffect(() => {
        if (maxCheckpoints > 0 && minCheckpoints >= maxCheckpoints) {
            onMaxCheckpointsChange(minCheckpoints);
        }
    }, [minCheckpoints]);

    // TBD: Kanske ska finnas inställning som gör att både isPrivate och inOrder inte påverkar sökresultatet

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text>Is private</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isPrivate ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={onIsPrivateChange}
                    value={isPrivate}
                />
            </View>

            <View style={styles.row}>
                <Text>Checkpoints has to be taken in order</Text>
                <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={inOrder ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={onInOrderChange}
                    value={inOrder}
                />
            </View>


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
    row: {
        flexDirection: 'row',
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