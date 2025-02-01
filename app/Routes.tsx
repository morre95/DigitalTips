import React from 'react';
import {View, StyleSheet} from 'react-native';

import ApiTemplate from '../components/ApiTemplate'

export default function Home() {

    return (
        <View style={styles.container}>
            {/*<ApiTemplate url={'http://10.0.2.2/myProjects/slimPhp4Test_Slask/json/test'} />*/}
            <ApiTemplate  />
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