import React, {createContext, useContext} from 'react';
import {useStorageState} from './useStorageState';
import * as SecureStore from "expo-secure-store";
import postJson from "@/functions/api/Post";
import {setPlayerId, setPlayerName} from "@/functions/common";


type LoginBody = {
    username: string,
    password: string
}

type ResponseProp = {
    error: boolean,
    message: string,
    token?: string,
    user?: number,
    playerName?: string,
}

const AuthContext = createContext<{
    signInApp: () => void;
    signOutApp: () => void;
    registerApp: () => void;
    isAppRegistered: () => boolean;
    token?: string | null;
    isLoading: boolean;
}>({
    signInApp: () => null,
    signOutApp: () => null,
    registerApp: () => null,
    isAppRegistered: () => false,
    token: null,
    isLoading: false,
});

export function useToken() {
    return useContext(AuthContext);
}

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const [[isLoading, token], setToken] = useStorageState('session');

    const isAppRegistered = false;

    const handleSignIn = async () => {
        const username = await SecureStore.getItemAsync('username');
        const password = await SecureStore.getItemAsync('password');
        if (username && password) {
            const body: LoginBody = {
                username: username,
                password: password
            }

            let response: ResponseProp;
            try {
                response = await postJson<LoginBody, ResponseProp>('login', body)
            } catch (error) {
                console.error(error);
                return;
            }

            if (!response.error && response.token && response.user) {
                await setPlayerId(response.user)
                await setPlayerName(response.playerName || null)
                setToken(response.token);
            } else {
                throw new Error("Login failed");
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signInApp: async () => {
                    await handleSignIn()
                },
                signOutApp: () => {
                    setToken(null);
                },
                registerApp: () => {
                    console.log('Register App, not implemented!!!');
                },
                isAppRegistered: () => {
                    console.log('isRegister App, not implemented yet!!!');
                    return false;
                },
                token,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
