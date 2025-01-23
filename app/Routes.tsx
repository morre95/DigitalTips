import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Text, View, StyleSheet, Button} from 'react-native';

interface Routes {
    answer_id: string
    answer_text: string
    checkpoint_id: string
    checkpoint_order: string
    is_correct: string
    latitude: string
    longitude: string
    question_id: string
    question_text: string
    route_id: string
    route_name: string
}

export default function Home() {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState<Routes[]>([]);

    const apiLogin = async () => {
        try {
            // Local Url
            const url = 'http://10.0.2.2/myProjects/slimPhp4Test_Slask/routes/all'
            // const url = 'http://tipsdigitial.mygamesonline.org/users/all'

            const response = await fetch(url, {
                headers: {
                    'Authorization': 'auth_ShouldBeAnEmptyString'
                }});
            /*for (const entry of response.headers.entries()) {
                console.log(entry[0] + ':' + entry[1]);
            }*/
            if(response.ok) {
                const json = await response.json();
                setData(json);

                //console.log(json);
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
                    title="Get all Routes"
                    color="#1abc9c"
            />
            {isLoading ? (
                <ActivityIndicator/>
            ) : (
                <FlatList
                    data={data}
                    /*keyExtractor={item => item.route_id}*/
                    renderItem={({item}) => (
                        <Text>
                            {item.route_name}, {item.question_text}
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