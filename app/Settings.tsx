import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, View, Text, StyleSheet, Button, Linking } from 'react-native';
import { fetchCityName } from '@/components/ReverseGeocoding';

export default function Settings() {
  const router = useRouter();  // Get the router instance

  const alertUser = (input : string) => {
    Alert.alert(input);
  }

  const openURL = (url : string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  }

  const openAppSettings = () => {
    Linking.openSettings();
  }

  const goToCredits = () => {
    // Navigate programmatically to the "Credits" page
    router.replace('/Credits');
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {goToCredits();}} title="Credits" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {openAppSettings();}} title="Manage Permissions" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {openURL("https://www.yahoo.com");}} title="Privacy Policy" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {openURL("https://www.google.com");}} title="Terms & Conditions" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {fetchCityName("58.753001", "17.008733").then(city => console.log(city));}} title="Nyköping" color="#1abc9c"/>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => {fetchCityName("48.855321", "2.345764").then(city => console.log(city));}} title="Paris" color="#1abc9c"/>
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
