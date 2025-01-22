import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getLocation } from '@/components/GeoLocation';

export default function Maps() {
  return (
    <View style={styles.container}>
      <Text>Maps Screen</Text>
      <Button title="Get Location" onPress={getLocation} />
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
