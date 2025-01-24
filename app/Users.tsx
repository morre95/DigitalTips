import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Text, View, StyleSheet, Button} from 'react-native';

interface User {
    id: number;
    uniq_id: string;
    username: string;
}

export default function Home() {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState<User[]>([]);

    const apiLogin = async () => {
        try {

            //const url = 'http://10.0.2.2/myProjects/slimPhp4Test_Slask/users/all' // Local Url
            const url = 'http://tipsdigitial.mygamesonline.org/users/all'

            const response = await fetch(url, {
                headers: {
                'Authorization': 'auth_ShouldBeAnEmptyString'
            }});
            for (const entry of response.headers.entries()) {
                console.log(entry[0] + ':' + entry[1]);
            }
            if(response.ok) {
                const json = await response.json();
                setData(json);
            } else {
                console.log(response);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /*useEffect( () => {
        apiLogin();
    }, []);*/

    return (
        <View style={styles.container}>
            <Button onPress={() => {
                apiLogin()
            }}
            title="Get users"
            color="#f194ff"
            />
            {isLoading ? (
                <ActivityIndicator/>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={item => item.uniq_id}
                    renderItem={({item}) => (
                        <Text>
                            {item.uniq_id}, {item.username}
                        </Text>
                    )}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});