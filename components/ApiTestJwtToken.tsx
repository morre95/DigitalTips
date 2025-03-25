import React, { useState } from 'react';
import {View, FlatList, Text, Button, StyleSheet, ActivityIndicator} from 'react-native';

import getJson, { getRestricted } from '@/functions/api/Get'

interface Props {
    token: string;
    url?: string;
}


interface RootData {
    key: string
    success: boolean
    decoded: Decoded
}

interface Decoded {
    iss: string
    aud: string
    iat: number
    nbf: number
    exp: number
    data: Data
}

interface Data {
    user_id: number
    roles: string[]
}


const ApiTestJwtToken: React.FC<Props> = ({ token, url = '/api/test/protected' }) => {

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState<RootData>();

    const get = async (url: string) => {
        try {
            setData(await getRestricted<RootData>(url, token));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Button onPress={() => {let p = get(url)}} title="Test token" color="#1abc9c"/>
            {isLoading ? (
                <ActivityIndicator/>
            ) : (
                <View>
                    <Text style={styles.title}>Token</Text>
                    <Text style={data?.success ? {color: 'green'} : {color: 'red'}}>{data?.decoded.data.roles[0]}</Text>
                </View>
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

export default ApiTestJwtToken;