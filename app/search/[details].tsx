import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SearchBar from "@/components/SearchBar";
import {getSearch, SearchResponse} from "@/functions/api/Get";
import {getPlayerId} from "@/functions/common";
import QrCodeModal from "@/components/search/QrCodeModal";
import SearchFilterSettings from "@/components/search/SearchFilterSettings"

interface SearchFilter {
    city?: string;
    count?: number;
    isPrivate?: boolean;
    inOrder?: boolean;
}

const filterSearch = (
    data: SearchResponse[],
    filter: SearchFilter
): SearchResponse[] => {
    return data.filter(item => {
        const matchesCity = !filter.city || item.city
            .split(',')
            .map(cityItem => cityItem.trim().toLowerCase())
            .some(cityItem => cityItem.includes(filter.city!.toLowerCase()));

        const matchesCount =
            filter.count || item.count === filter.count;
        const matchesIsPrivate =
            filter.isPrivate || item.isPrivate === filter.isPrivate;
        const matchesInOrder =
            filter.inOrder || item.inOrder === filter.inOrder;

        return (
            matchesCity &&
            matchesCount &&
            matchesIsPrivate &&
            matchesInOrder
        );
    });
};

interface IProps {

}

const Details = ({}: IProps) => {
    const { details } = useLocalSearchParams<{details: string}>();
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [searchInFokus, setSearchInFokus] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<SearchResponse[]>([]);
    const [rawData, setRawData] = useState<SearchResponse[]>([]);
    const [maxCheckpoints, setMaxCheckpoints] = useState<number>(0);
    const [minCheckpoints, setMinCheckpoints] = useState<number>(0);
    const [appUserId, setAppUserId] = useState<number | null>(null);

    const [city, setCity] = useState('');

    useEffect(() => {
        (async () => {
            setAppUserId(await getPlayerId());
        })();
    }, []);

    useEffect(() => {
        (async () => {
            await onSearchPhraseChange(details);
        })()
    }, [details]);

    useEffect(() => {
        console.log(city)
        //setFilteredData(filterSearch(rawData, { city: city }));
        setFilteredData(
            rawData.filter(item => item.city
                .split(',')
                .map(cityItem => cityItem.trim().toLowerCase())
                .some(cityItem => cityItem.includes(city.toLowerCase()))
            )
        );
    }, [city]);

    const onSearchPhraseChange = async (text: string) => {
        setSearchPhrase(text);
        if (text.length > 2) {
            const filtered = await getSearch(text);
            if (filtered) {
                console.log(filtered);
                setFilteredData(filtered);
                setRawData(filtered);
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
                placeholder={''}
            />
            <SearchFilterSettings
                city={city}
                onCityChange={setCity}
                minCheckpoints={minCheckpoints}
                onMinCheckpointsChange={setMinCheckpoints}
                maxCheckpoints={maxCheckpoints}
                onMaxCheckpointsChange={setMaxCheckpoints}
            />
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