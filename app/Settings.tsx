import React from 'react';
import { Alert, View, Text, StyleSheet, Button } from 'react-native';

export default function Settings() {

  const alertUser = (input : string) => {
    Alert.alert(input);
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {alertUser("credits");}} title="Credits" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {alertUser("permissions");}} title="Manage Permissions" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {alertUser("privacy");}} title="Privacy Policy" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {alertUser("terms");}} title="Terms & Conditions" color="#1abc9c"/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 32,
  },
  buttonContainer: {
    width: 200,
    height: 50,
  },
});
