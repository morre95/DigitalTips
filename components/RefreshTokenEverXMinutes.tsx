import React, {useEffect} from 'react';
import {useToken} from "@/components/login/LoginContext";
import * as SecureStore from "expo-secure-store";


const thisKeyIsHardToGuess = "a25e069128262ba27d1a0ef8bf64bece";

async function setTime(): Promise<void> {
    await SecureStore.setItemAsync(thisKeyIsHardToGuess, new Date().getTime().toString());
}

async function getTime(): Promise<number | null> {
    const result = await SecureStore.getItemAsync(thisKeyIsHardToGuess);
    if (!result) {
        return null;
    }
    return Number(result);
}

interface IRefreshTokenEverXMinutes {
    minutes: number;
}

const RefreshTokenEverXMinutes = ({minutes}: IRefreshTokenEverXMinutes) => {
    const {signOutApp, signInApp} = useToken();

    useEffect(() => {
        let interval: string | number | NodeJS.Timeout | undefined;
        (async () => {
            signOutApp();
            await signInApp();
            await setTime();

            interval = setInterval(checkTimeInterval, 60_000);
        })();
        return () => clearInterval(interval);
    }, [minutes]);

    const checkTimeInterval = async () => {
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
    };

    return null;

}

export default RefreshTokenEverXMinutes;