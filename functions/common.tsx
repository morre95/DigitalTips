import * as SecureStore from 'expo-secure-store';

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPlayerName(): Promise<string | null> {
    return await SecureStore.getItemAsync('playerName');
}

export async function setPlayerName(playerName: string | null): Promise<void> {
    if (playerName === null) await SecureStore.deleteItemAsync('playerName');
    else await SecureStore.setItemAsync('playerName', playerName);
}

export async function getPlayerId(): Promise<number> {
    const id = await SecureStore.getItemAsync('playerId');
    if (!id) {
        return -1;
    }
    return Number(id)
}

export async function setPlayerId(playerId: number): Promise<void> {
    if (playerId > 0) await SecureStore.setItemAsync('playerId', playerId.toString());
    else await SecureStore.deleteItemAsync('playerId');
}