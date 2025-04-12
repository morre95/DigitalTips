import React, {useEffect} from 'react';
import {useToken} from "@/components/login/LoginContext";
import * as SecureStore from "expo-secure-store";


const secretKey = "a25e069128262ba27d1a0ef8bf64bece";

async function setTime(): Promise<void> {
    await SecureStore.setItemAsync(secretKey, new Date().getTime().toString());
}

async function getTime(): Promise<number | null> {
    const result = await SecureStore.getItemAsync(secretKey);
    if (!result) {
        return null;
    }
    return Number(result);
}

interface IRefreshTokenEverXMinutes {
    minutes: number;
}

const RefreshTokenEverXMinutes = ({minutes}: IRefreshTokenEverXMinutes) => {
    const {token, signOutApp, signInApp} = useToken();
    useEffect(() => {
        (async () => {
            const time = await getTime();
            if (time) {
                const now = new Date().getTime();
                const timeSinceLastRefresh = (now - time) / 1000;
                if (minutes < timeSinceLastRefresh / 60) {
                    signOutApp();
                    await signInApp();
                    await setTime();
                }
            } else {
                signOutApp();
                await signInApp();
                await setTime();
            }
        })();
    }, [minutes]);

    useEffect(() => {
        if (token) {
            (async () => {
                await setTime();
            })();
        }
    }, [token]);

    return (
        <></>
    )
}

export default RefreshTokenEverXMinutes;