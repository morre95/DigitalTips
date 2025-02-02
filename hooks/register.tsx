import postJson from './api/Post'
import * as Crypto from 'expo-crypto';
import BaseUrl from "@/hooks/api/BaseUrl";

import * as SecureStore from 'expo-secure-store';

type BodyProp = {
    username: string,
    password: string
}

type ResponseProp = {
    error: boolean,
    message: string
}

const register = async () => {
    let savedUsername = await SecureStore.getItemAsync('username');
    if (savedUsername) {
        console.log('Det finns sparat lösen och användarnamn', savedUsername);
        return;
    }

    const username = Crypto.randomUUID();
    //console.log('Your username: ' + username);

    const timeStr = Date.now().toString();
    const pass = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${timeStr}-${username}`);

    //console.log('Your password: ' + pass);
    const body : BodyProp = {
        username: username,
        password: pass
    }

    const response = await postJson<BodyProp, ResponseProp>('register', body)

    //console.log('svar:', response)
    if (!response.error) {
        //console.log('Japp sparad')
        await SecureStore.setItemAsync('username', username);
        await SecureStore.setItemAsync('password', pass);
    }


    console.log("Registered");

}

export default register;