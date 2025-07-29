import React, {useCallback} from 'react';
import {Platform} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Tabs, useFocusEffect} from 'expo-router';
import {TokenProvider} from "@/components/login/LoginContext";
import RefreshTokenEverXMinutes from '@/components/RefreshTokenEverXMinutes';
import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';

export default function AppLayout() {
    useFocusEffect(
        useCallback(() => {
            const timeout = setTimeout(() => {
                if (Platform.OS === "android") {
                    // FIXME: Detta ger varning om att det inte stöds när edge-to-edge är enabled.
                    // Har sat "edgeToEdgeEnabled": false i app.json under "android". Men det hjälper inte
                    // Här finns mer info om edge-to-edge i Android: https://expo.dev/blog/edge-to-edge-display-now-streamlined-for-android
                    setStatusBarBackgroundColor('#fff');
                }
            }, 400);

            return () => {
                clearTimeout(timeout);
            };
        }, []),
    );
    return (
        <TokenProvider>
            <RefreshTokenEverXMinutes
                minutes={45}
            />
            <StatusBar style="dark" />
            <Tabs
                screenOptions={{
                    tabBarHideOnKeyboard: true,
                }}
            >
                <Tabs.Screen
                    name="CreateRoutes"
                    options={{
                        headerShown: false,
                        title: "Create New Routes",
                        tabBarIcon: ({focused}) => (
                            <FontAwesome5 name="route" size={24}
                                          color={focused ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)"}/>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="Maps"
                    options={{
                        headerShown: false,
                        title: "Maps",
                        tabBarIcon: ({focused}) => (
                            <FontAwesome5 name="map-marked-alt" size={24}
                                          color={focused ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)"}/>
                        )
                    }}
                />
                <Tabs.Screen
                    name="Settings"
                    options={{
                        title: "Settings",
                        tabBarIcon: ({focused}) => (
                            <Ionicons name="settings" size={24}
                                      color={focused ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.5)"}/>
                        )
                    }}
                />

                <Tabs.Screen name="[...unmatched]" options={{href: null, headerShown: false}}/>
                <Tabs.Screen name="Credits" options={{href: null}}/>
                <Tabs.Screen name="search/[details]" options={
                    {
                        href: null,
                        title: "Search Details",
                        headerShown: false,
                    }
                }/>
                <Tabs.Screen name="sign-in-app" options={{href: null}}/>
                <Tabs.Screen name="QrCodeReader" options={{href: null}}/>
                <Tabs.Screen name="search/MyRoutes" options={{
                    href: null,
                    title: "My Routes",
                    headerShown: false,
                }}/>
            </Tabs>
        </TokenProvider>
    );
}

