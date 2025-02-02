import postJson from './api/Post'
import * as Crypto from 'expo-crypto';
import BaseUrl from "@/hooks/api/BaseUrl";

import register from './register'

import globals from './globals'

import * as SecureStore from 'expo-secure-store';

type BodyProp = {
    username: string,
    password: string
}

type ResponseProp = {
    error: boolean,
    message: string,
    token: string
}

let retryCount = 0;

const registerOrLogin = async () => {
    /*await SecureStore.deleteItemAsync('username');
    await SecureStore.deleteItemAsync('password');
    return;*/

    const username = await SecureStore.getItemAsync('username');
    const password = await SecureStore.getItemAsync('password');
    if (!username || !password) {
        let result : boolean = await register()

        if (retryCount <= 5) {
            retryCount++
            console.log(`${retryCount} register trys`)
            await registerOrLogin();
        }
    } else {
        const body : BodyProp = {
            username: username,
            password: password
        }

        const response = await postJson<BodyProp, ResponseProp>('login', body)
        if (!response.error) {
            globals.JWT_token = response.token
            //console.log(globals.JWT_token)
        } else {
            console.error('Ingen token', response.message);
        }
    }
}

export default registerOrLogin;
export { globals };