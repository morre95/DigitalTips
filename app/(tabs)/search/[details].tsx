import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Link,  useLocalSearchParams } from 'expo-router';
import SearchBar from "@/components/SearchBar";
import {getSearch, SearchResponse} from "@/functions/api/Get";
import {getPlayerId} from "@/functions/common";
import QrCodeModal from "@/components/QrCodeModal";
import SearchFilterSettings from "@/components/search/SearchFilterSettings";
import {useToken} from "@/components/login/LoginContext";

interface IProps {

}

const Details = ({}: IProps) => {
    const { details } = useLocalSearchParams<{details: string}>();
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [searchInFokus, setSearchInFokus] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<SearchResponse[]>([]);
    const [rawData, setRawData] = useState<SearchResponse[]>([]);
    const [appUserId, setAppUserId] = useState<number | null>(null);

    const [city, setCity] = useState('');
    const [maxCheckpoints, setMaxCheckpoints] = useState<number>(0);
    const [minCheckpoints, setMinCheckpoints] = useState<number>(0);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [inOrder, setInOrder] = useState<boolean>(true);
    const {token, signInApp} = useToken();

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

    useEffect(() => {
        const max = maxCheckpoints === 0 ? Number.MAX_SAFE_INTEGER : maxCheckpoints;
        setFilteredData(
            rawData.filter(item => item.count <= max && item.count >= minCheckpoints)
        );
    }, [minCheckpoints, maxCheckpoints]);

    useEffect(() => {
        setFilteredData(
            rawData.filter(item => item.isPrivate === isPrivate)
        );
    }, [isPrivate]);

    useEffect(() => {
        setFilteredData(
            rawData.filter(item => item.inOrder === inOrder)
        );
    }, [inOrder]);

    const onSearchPhraseChange = async (text: string) => {
        setSearchPhrase(text);
        if (text.length > 2) {

            if (!token) {
                await signInApp();
            }

            const filtered = await getSearch(text, token as string);
            if (filtered) {
                /*console.log('onSearchPhraseChange()', filtered);*/
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
                isPrivate={isPrivate}
                onIsPrivateChange={setIsPrivate}
                inOrder={inOrder}
                onInOrderChange={setInOrder}
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
                ListEmptyComponent={() => <EmptyComponent />}
                ListHeaderComponent={() => <ListHeader />}
                ListFooterComponent={() => <ListFooter />}
            />
        </View>
    )
}

const EmptyComponent = () => {
    return (
        <View style={styles.item}>
            <Text>There is no search result yet</Text>
        </View>
    )
}

const ListHeader = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>The search result</Text>
        </View>
    )
}

const ListFooter = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>There is no more reach result</Text>
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
            <Link
                style={styles.name}
                href={{
                    pathname: './Maps',
                    params: {routeId: routeId}
                }}
            >{name}</Link>
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

    header: {
        backgroundColor: '#000b5c',
        marginVertical: 20,
        borderRadius: 10,
        padding: 10,
    },
    headerText: {
        fontSize: 18,
        color: '#ffffff',
    },
    footer: {
        backgroundColor: '#53686e',
        borderRadius: 8,
        padding: 10,
        marginVertical: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#ffffff',
    },
});

export default Details;