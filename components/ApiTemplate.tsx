import React, { useState, useEffect } from 'react';
import {View, FlatList, Text, Button, StyleSheet, ActivityIndicator} from 'react-native';

import getJson, { BaseUrl } from '../hooks/api/Get'

interface Props {
    url?: string;
}

interface Route {
    key: string
    title: string
    description: string
    is_right: boolean
}

const ApiTemplate: React.FC<Props> = ({ url = 'json/test' }) => {

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState<Route[]>([]);

    const get = async (url: string) => {
        try {
            setData(await getJson<Route[]>(url));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    // TBD: använd denna istället för knappen om man vill att det ska laddas direkt
    /*useEffect( () => {
        const p = get(url);
    }, []);*/

    return (
        <View style={styles.container}>
            <Button onPress={() => {let p = get(url)}} title="Get json test" color="#1abc9c"/>
            {isLoading ? (
                <ActivityIndicator/>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={item => item.key}
                    renderItem={({item}) => (
                        <View>
                            <Text style={styles.title}>
                                {item.title}
                            </Text>
                            <Text>
                                {item.description}
                            </Text>
                            <Text>
                                {item.is_right ? <Text style={{color:'green'}}>Yes</Text>: <Text style={{color:'red'}}>No</Text>}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    }
})

export default ApiTemplate;