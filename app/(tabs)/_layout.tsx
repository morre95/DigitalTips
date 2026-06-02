import React from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Tabs} from 'expo-router';
import {TokenProvider} from "@/components/login/LoginContext";
import RefreshTokenEverXMinutes from '@/components/RefreshTokenEverXMinutes';
import { StatusBar } from 'expo-status-bar';

export default function AppLayout() {
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

                <Tabs.Screen name="Result" options={{href: null, headerShown: false}}/>
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

