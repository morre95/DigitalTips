import {registerUser} from '@/functions/api/Post'
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {setPlayerId, setPlayerName} from "@/functions/common";

type BodyProp = {
    username: string;
    password: string;
}

type ResponseProp = {
    error: boolean;
    message: string;
    userId?: number;
}

const register = async (): Promise<boolean> => {
    let savedUsername = await SecureStore.getItemAsync('username');
    let savedPassword = await SecureStore.getItemAsync('password');
    if (savedUsername !== null && savedPassword !== null) {
        return true;
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
    } else if (response.userId) {
        await SecureStore.setItemAsync('username', username);
        await SecureStore.setItemAsync('password', pass);
        await setPlayerId(response.userId);
        await setPlayerName('Player 1');
        return true;
    }

    return false;
}

export default register;