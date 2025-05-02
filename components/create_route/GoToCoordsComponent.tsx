import React from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList} from 'react-native';
import {getCity, getCoordinatesFromAddress} from "@/functions/request";
import EvilIcons from '@expo/vector-icons/EvilIcons';

type CoordsFound = {
    longitude: number;
    latitude: number;
}

interface IProps {
    onCoordsFound: (coordsFound: CoordsFound) => void;
}

type ItemProps = {
    city: string;
    latitude: number;
    longitude: number;
};

type IData = {
    id: string;
    city: string;
    latitude: number;
    longitude: number;
}

const GoToCoordsComponent = ({onCoordsFound}: IProps) => {
    const [text, onChangeText] = React.useState('');
    const [geoCodingResult, setGeocodingResult] = React.useState<IData[] | null>(null);

    const handleOnSubmit = async () => {
        if (text.length > 2) {
            const result = await getCoordinatesFromAddress(text);
            if (result?.length === 1) {
                onCoordsFound({longitude: result[0].longitude, latitude: result[0].latitude});
            } else if (result && result.length > 1) {
                const citys = []
                for (let i = 0; i < result.length; i++) {
                    const city = await getCity({latitude: result[i].latitude, longitude: result[i].longitude});
                    if (city) {
                        citys.push({city: city, latitude: result[i].latitude, longitude: result[i].longitude});
                    }
                }

                setGeocodingResult(citys.map((item, index) => ({
                    id: index.toString(),
                    city: item.city,
                    latitude: item.latitude,
                    longitude: item.longitude
                })));
            } else {
                setGeocodingResult(null);
            }
        } else {
            setGeocodingResult(null);
        }
    };

    const Item = ({city, longitude, latitude}: ItemProps) => {
        return (
            <View style={styles.item}>
                <TouchableOpacity
                    onPress={() => onCoordsFound({longitude, latitude})}
                >
                    <Text style={styles.title}>{city}</Text>
                </TouchableOpacity>
            </View>
        )
    };

    return (
        <View>
            <FlatList
                data={geoCodingResult}
                renderItem={({item}) =>
                    <Item
                        city={item.city}
                        longitude={item.longitude}
                        latitude={item.latitude}
                    />}
                keyExtractor={item => item.id}
            />
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeText}
                    onSubmitEditing={handleOnSubmit}
                    placeholder={'Go to address'}
                    value={text}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleOnSubmit}
                >
                    <EvilIcons name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        paddingRight: 30
    },
    button: {
        marginTop: 20,
        marginLeft: -38,
    },
    buttonText: {
        textAlign: 'center',
        padding: 20,
        color: 'white',
    },

    item: {
        backgroundColor: '#f9c2ff',
        padding: 2,
        marginVertical: 1,
        marginHorizontal: 2,
    },
    title: {
        fontSize: 32,
    },
});

export default GoToCoordsComponent;