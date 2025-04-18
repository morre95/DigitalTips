import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {getPlayerId} from "@/functions/common";
import {useToken} from "@/components/login/LoginContext";
import {getMyRoutes, SearchResponse} from "@/functions/api/Get";
import QrCodeModal from "@/components/search/QrCodeModal";

const MyRoutes = () => {
    const [appUserId, setAppUserId] = useState<number | null>(null);
    const [myRoutes, setMyRoutes] = useState<SearchResponse[]>([]);
    const {token, signInApp} = useToken();

    useEffect(() => {
        (async () => {
            const playerId = await getPlayerId();
            setAppUserId(playerId);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            await handleMyRoutes();
        })();
    }, [appUserId]);

    const handleMyRoutes = async () => {
        if (!token) {
            await signInApp();
        }


        if (appUserId) {
            const routes = await getMyRoutes(appUserId, token as string);
            if (routes) {
                setMyRoutes(routes);
            }
        }
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={myRoutes}
                keyExtractor={item => item.routeId.toString()}
                renderItem={({item}) =>
                    <Item
                        routeId={item.routeId}
                        name={item.name}
                        city={item.city}
                        description={item.description}
                        date={item.date}
                        startAt={item.startAt}
                        endAt={item.endAt}
                    />
                }
                ListEmptyComponent={() => <EmptyComponent />}
                ListHeaderComponent={() => <ListHeader />}
                ListFooterComponent={() => <ListFooter />}
            />
        </View>
    )
}

const ListHeader = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>The routes you created</Text>
        </View>
    )
}

const ListFooter = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>There is no more routes for you here</Text>
        </View>
    )
}

const EmptyComponent = () => {
    return (
        <View style={styles.item}>
            <Text>You have no routes yet</Text>
        </View>
    )
}

interface ItemProps {
    routeId: number;
    name: string;
    city: string;
    description: string;
    date: Date;
    startAt?: Date;
    endAt?: Date;
}
const Item = ({routeId, name, city, description, date, startAt, endAt}: ItemProps) => {
    const [showQrCode, setShowQrCode] = useState<boolean>(false);

    return (
        <View style={styles.item}>
            <Text style={styles.name}>{name}</Text>
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

export default MyRoutes;