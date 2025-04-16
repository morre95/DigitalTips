import React, {createContext, useContext, useEffect, useState} from 'react';
import {useStorageState} from '../../hooks/useStorageState';
import * as SecureStore from "expo-secure-store";
import postJson from "@/functions/api/Post";
import {setPlayerId, setPlayerName} from "@/functions/common";
import register from "@/functions/register";
import resetAppUser from "@/functions/restAppUser";


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
    signInApp: () => Promise<void>;
    signOutApp: () => void;
    isAppRegisteredAsync: () => Promise<boolean>;
    token?: string | null;
    isLoading: boolean;
}>({
    signInApp: async () => {},
    signOutApp: () => null,
    isAppRegisteredAsync: async () => true,
    token: null,
    isLoading: false,
});

export function useToken() {
    return useContext(AuthContext);
}

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const [[isLoading, token], setToken] = useStorageState('session');
    const [isAppRegistered, setIsAppRegistered] = useState(false);

    useEffect(() => {
        (async () => {
            const result = await handleIsAppRegistered();
            if (!result) {
                if (await register()) {
                    setIsAppRegistered(true);
                } else {
                    throw new Error('Could not register app')
                }
            }
        })();
    }, [isAppRegistered]);

    const handleIsAppRegistered = async (): Promise<boolean> => {
        const username = await SecureStore.getItemAsync('username');
        const password = await SecureStore.getItemAsync('password');
        return username !== null && password !== null
    };

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
                setToken(null);
                console.error('Error 123', error);
                return;
            }

            if (!response.error && response.token && response.user) {
                await setPlayerId(response.user);
                await setPlayerName(response.playerName || null);
                setToken(response.token);
            } else if (response.error && !response.token && !response.user) {
                console.log(response.message)
                setToken(null);
                await resetAppUser();
                setIsAppRegistered(!isAppRegistered);
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
                isAppRegisteredAsync: async () => {
                    return await handleIsAppRegistered();
                },
                token,
                isLoading,
            }}>
            {children}
        </AuthContext.Provider>
    );
}
