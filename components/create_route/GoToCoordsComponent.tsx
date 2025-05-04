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
        if (text.length < 1) { return; }
        const result = await getCoordinatesFromAddress(text);
        if (result?.length === 1) {
            onCoordsFound({longitude: result[0].longitude, latitude: result[0].latitude});
        } else if (result && result.length > 1) {
            const citys = [];
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
            setGeocodingResult([{
                id: '999',
                city: 'No results found',
                latitude: -10000,
                longitude: -10000
            }]);
        }
    };

    const handleCoordsFound = (coords: CoordsFound) => {
        if (coords.latitude !== -10000 && coords.longitude !== -10000) {
            onCoordsFound(coords);
        }
    }

    const Item = ({city, longitude, latitude}: ItemProps) => {
        return (
            <View style={styles.searchItem}>
                <TouchableOpacity
                    onPress={() => handleCoordsFound({longitude, latitude})}
                >
                    <Text style={styles.searchTitle}>{city}</Text>
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
                    <EvilIcons style={styles.buttonIcon} name="search" size={24} color="black" />
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
        flex: 1,
        height: 40,
        margin: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        paddingRight: 30,
    },
    button: {

    },
    buttonIcon: {
        marginTop: 20,
        marginLeft: -43,
    },

    searchItem: {
        backgroundColor: '#5b91fb',
        padding: 8,
        marginVertical: 4,
        marginHorizontal: 2,
        borderRadius: 12
    },
    searchTitle: {

        fontSize: 16,
        color: '#fff'
    },
});

export default GoToCoordsComponent;