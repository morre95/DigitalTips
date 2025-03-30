import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SearchBar from "@/components/SearchBar";


function addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
}

interface IData {
    id: string;
    name: string;
    owner: number;
    city: string;
    description: string;
    date: Date;
}

const DATA : IData[] = [
    {
        id: '1',
        owner: 0,
        name: 'First Item',
        city: 'London',
        description: 'First Item Description',
        date: new Date(),
    },
    {
        id: '2',
        owner: 1,
        name: 'Second Item',
        city: 'Stockholm',
        description: 'Second Item Description',
        date: addDays(new Date(), 2)
    },
    {
        id: '3',
        owner: 2,
        name: 'Third Item',
        city: 'Uddevalla',
        description: 'Third Item Description',
        date: addDays(new Date(), -35),
    },
];

interface IProps {

}

const Details = ({}: IProps) => {
    const { details } = useLocalSearchParams<{details: string}>();
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [clicked, setClicked] = useState<boolean>(false);

    useEffect(() => {
        setSearchPhrase(details);
    }, [details]);

    return (
        <View style={styles.container}>
            <SearchBar
                clicked={clicked}
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                setClicked={setClicked}
            />
            <FlatList
                data={DATA}
                renderItem={({item}) => <Item name={item.name} owner={item.owner} city={item.city} description={item.description} date={item.date} />}
                keyExtractor={item => item.id}
            />
        </View>
    )
}

interface ItemProps {
    name: string;
    owner: number;
    city: string;
    description: string;
    date: Date;
}
const Item = ({name, owner, city, description, date}: ItemProps) => {
    const users = [
        'Kalle',
        'Walle',
        'Skalle'
    ]

    const padStart = (value: number): string =>
        value.toString().padStart(2, '0');
    const formatDate = (date: Date): string =>
        `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())} ` +
        `${padStart(date.getHours())}:${padStart(date.getMinutes())}`
    return (
        <View style={styles.item}>
            <Text style={styles.name}>{name}</Text>
            <Text>Creator: {users[owner]}</Text>
            <Text>{description}</Text>
            <Text>{city}</Text>
            <Text>{formatDate(date)}</Text>
        </View>
    );
}

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
        backgroundColor: '#96aab3',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 5,
    },
    name: {
        fontSize: 32,
    },
});

export default Details;