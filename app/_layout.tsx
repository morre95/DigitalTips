import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AppLayout() {
  return (
    <Tabs>

        <Tabs.Screen
            name="Routes"
            options={{
                title: "Create New",
                tabBarIcon: ({ focused }) => (
                    <FontAwesome5 name="route" size={24} color={ focused ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)"} />
                )
            }}
        />
        {/*<Tabs.Screen
            name="Routes"
            options={{ href: null }}
        />*/}

      <Tabs.Screen 
        name="Maps" 
        options={{ 
          title: "Maps",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="map-marked-alt" size={24} color={ focused ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)"} />
          )
        }} 
      />
      <Tabs.Screen 
        name="Settings" 
        options={{ 
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Ionicons name="settings" size={24} color={ focused ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)"} />
          )
        }} 
      />

      <Tabs.Screen name="[...unmatched]" options={{ href: null }} />
      <Tabs.Screen name="Credits" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
