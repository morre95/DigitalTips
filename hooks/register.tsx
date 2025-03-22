import {registerUser} from './api/Post'
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

type BodyProp = {
    username: string,
    password: string
}

type ResponseProp = {
    error: boolean,
    message: string
}

const register: () => Promise<boolean> = async () => {
    let savedUsername = await SecureStore.getItemAsync('username');
    if (savedUsername) {
        return false;
    }

    const username = Crypto.randomUUID();

    const timeStr = Date.now().toString();
    const pass = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${timeStr}-${username}`);

    const body : BodyProp = {
        username: username,
        password: pass
    }

    const response = await registerUser<BodyProp, ResponseProp>(body)

    if (response.error) {

        return false;
    }

    if (!response.error) {
        await SecureStore.setItemAsync('username', username);
        await SecureStore.setItemAsync('password', pass);
        return true;
    }

    return false
}

export default register;