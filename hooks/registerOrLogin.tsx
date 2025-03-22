import postJson from './api/Post'
import register from './register'
import globals from './globals'
import * as SecureStore from 'expo-secure-store';
import {setPlayerId, setPlayerName} from "@/functions/common";

type BodyProp = {
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

let retryCount = 0;

const registerOrLogin = async () => {
    if (globals.JWT_token) {
        return;
    }

    const username = await SecureStore.getItemAsync('username');
    const password = await SecureStore.getItemAsync('password');
    if (!username || !password) {
        await register()
        if (retryCount <= 5) {
            retryCount++
            await registerOrLogin();
        }
    } else {
        const body : BodyProp = {
            username: username,
            password: password
        }

        let response: ResponseProp;
        try {
            response = await postJson<BodyProp, ResponseProp>('login', body)
        } catch (error) {
            if (retryCount <= 5) {
                retryCount++
                await SecureStore.deleteItemAsync('username');
                await SecureStore.deleteItemAsync('password');
                return await registerOrLogin();
            }
            return;
        }

        if (!response.error && response.token && response.user) {
            globals.JWT_token = response.token
            await setPlayerId(response.user)
            await setPlayerName(response.playerName || null)
        } else if (retryCount <= 5) {
            retryCount++
            await SecureStore.deleteItemAsync('username');
            await SecureStore.deleteItemAsync('password');
            await registerOrLogin();
        } else {
            console.error('Ingen token', response.message);

        }
    }
}

export default registerOrLogin;
export { globals };