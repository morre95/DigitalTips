import React from 'react';
import { useRouter, useNavigation } from 'expo-router';
import { Alert, View, Text, StyleSheet, Button, Linking } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Credits() {
    const router = useRouter();
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <AntDesign name="arrowleft" size={24} color="black" onPress={() => router.replace('/Settings')} style={{ marginLeft: 15, marginRight: 10 }}/>
            ),
        });
    }, [navigation, router]);

    const goBackToSettings = () => {
        router.replace('/Settings');
    }

    return (
        <View style={styles.container}>
          <Text>Josef Swadi Johansson - Utvecklare</Text>
          <Text>Erik Morén - Utvecklare</Text>
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
