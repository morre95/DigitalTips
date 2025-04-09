import * as SecureStore from "expo-secure-store";

export default async function resetAppUser () {
    await SecureStore.deleteItemAsync('username');
    await SecureStore.deleteItemAsync('password');
}