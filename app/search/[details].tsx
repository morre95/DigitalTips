import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import { useLocalSearchParams } from 'expo-router';


const DATA = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: 'First Item',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: 'Second Item',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        title: 'Third Item',
    },
];

interface IProps {

}

const Details = ({}: IProps) => {
    const { details } = useLocalSearchParams<{details: string}>();
    return (
        <View style={styles.container}>
            <Text>Your search: <Text style={styles.details}>{details}</Text></Text>
            <FlatList
                data={DATA}
                renderItem={({item}) => <Item title={item.title} />}
                keyExtractor={item => item.id}
            />
        </View>
    )
}


type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
    <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        fontWeight: 'bold',
        color: 'red',
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 32,
    },
});

export default Details;