import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SearchBar from "@/components/SearchBar";
import {getSearch, SearchResponse} from "@/functions/api/Get";
import {getPlayerId} from "@/functions/common";
import QrCodeModal from "@/components/search/QrCodeModal";
import SearchSettings from "@/components/search/SearchSettings"

interface IProps {

}

const Details = ({}: IProps) => {
    const { details } = useLocalSearchParams<{details: string}>();
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [searchInFokus, setSearchInFokus] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<SearchResponse[]>([]);
    const [appUserId, setAppUserId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            setAppUserId(await getPlayerId());
        })();
    }, []);

    useEffect(() => {
        setSearchPhrase(details);
    }, [details]);

    const onSearchPhraseChange = async (text: string) => {
        setSearchPhrase(text);
        if (text.length > 2) {
            const filtered = await getSearch(text);
            if (filtered) {
                console.log(filtered);
                setFilteredData(filtered);
            }
        } else {
            setFilteredData([]);
        }
    }

    return (
        <View style={styles.container}>
            <SearchBar
                inFokus={searchInFokus}
                searchPhrase={searchPhrase}
                onSearchPhraseChange={onSearchPhraseChange}
                onFokusChange={setSearchInFokus}
            />
            <SearchSettings />
            <FlatList
                data={filteredData}
                renderItem={({item}) =>
                    <Item
                        routeId={item.routeId}
                        name={item.name}
                        city={item.city}
                        description={item.description}
                        date={item.date}
                        isAdmin={Number(item.owner) === appUserId}
                        startAt={item.startAt}
                        endAt={item.endAt}
                    />}
                keyExtractor={item => item.routeId.toString()}
            />
        </View>
    )
}

interface ItemProps {
    routeId: number;
    name: string;
    city: string;
    description: string;
    date: Date;
    isAdmin: boolean;
    startAt?: Date;
    endAt?: Date;
}
const Item = ({routeId, name, city, description, date, isAdmin, startAt, endAt}: ItemProps) => {
    const [showQrCode, setShowQrCode] = useState<boolean>(false);

    return (
        <View style={styles.item}>
            <Text style={styles.name}>{name}</Text>
            <Text>Creator: {isAdmin ? 'Yes' : 'No'}</Text>
            <Text>{description}</Text>
            <Text>{city}</Text>
            <Text>Starts: {startAt?.toLocaleString()}</Text>
            <Text>Ends: {endAt?.toLocaleString()}</Text>
            <Text>Created at: {date.toLocaleString()}</Text>
            <QrCodeModal
                routeId={routeId}
                name={name}
                visible={showQrCode}
                close={() => setShowQrCode(false)}
                open={() => setShowQrCode(true)}
            />
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