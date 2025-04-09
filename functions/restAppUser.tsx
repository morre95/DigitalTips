import * as SecureStore from "expo-secure-store";
import {setPlayerId, setPlayerName} from "@/functions/common";

export default async function resetAppUser () {
    await SecureStore.deleteItemAsync('username');
    await SecureStore.deleteItemAsync('password');

    await setPlayerId(-1);
    await setPlayerName(null);
}